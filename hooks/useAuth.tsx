import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';

import { checkEmailRegistered } from '@/lib/authService';
import { hasRecoveryUrlParams } from '@/lib/recoverySession';
import { isSupabaseConfigured, getSupabase, requireSupabase } from '@/lib/supabase';
import { getPasswordResetRedirectUrl } from '@/lib/authRedirect';
import { fetchUserProfile, updateUserProfile, type ProfileUpdates } from '@/lib/profileService';
import { finishUserProgram } from '@/lib/userProgramService';
import { DEMO_USER, DEMO_TRAINER, mockUser, mockTrainerUser } from '@/lib/mockData';
import type { UserProfile } from '@/lib/types';

interface AuthContextValue {
  user: UserProfile | null;
  isLoading: boolean;
  isDemoMode: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error?: string }>;
  resetPassword: (email: string) => Promise<{ error?: string; success?: boolean }>;
  updateProfile: (updates: ProfileUpdates) => Promise<{ error?: string }>;
  refreshUser: () => Promise<void>;
  finishActiveProgram: (programId: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isDemoMode = !isSupabaseConfigured;

  const loadUserFromSupabase = useCallback(async (authUser: User) => {
    const profile = await fetchUserProfile(authUser.id);
    setUser(profile ?? mapSupabaseUserFallback(authUser));
  }, []);

  useEffect(() => {
    if (isDemoMode) {
      setIsLoading(false);
      return;
    }

    let subscription: { unsubscribe: () => void } | undefined;

    async function init() {
      const supabase = getSupabase();
      if (!supabase) {
        setIsLoading(false);
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (data.session?.user && !hasRecoveryUrlParams()) {
        await loadUserFromSupabase(data.session.user);
      }
      setIsLoading(false);

      const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          if (event === 'PASSWORD_RECOVERY' || hasRecoveryUrlParams()) {
            return;
          }
          await loadUserFromSupabase(session.user);
        } else {
          setUser(null);
        }
      });
      subscription = listener.subscription;
    }

    init();
    return () => subscription?.unsubscribe();
  }, [isDemoMode, loadUserFromSupabase]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (isDemoMode) {
        if (email === DEMO_USER.email && password === DEMO_USER.password) {
          setUser(mockUser);
          return {};
        }
        if (email === DEMO_TRAINER.email && password === DEMO_TRAINER.password) {
          setUser(mockTrainerUser);
          return {};
        }
        return {
          error:
            'Credenciales incorrectas. Usa demo@programaciones.online o entrenador@programaciones.online / demo1234',
        };
      }

      const { data, error } = await requireSupabase().auth.signInWithPassword({ email, password });
      if (error) return { error: mapSignInError(error.message) };
      if (data.user) await loadUserFromSupabase(data.user);
      return {};
    },
    [isDemoMode, loadUserFromSupabase],
  );

  const signUp = useCallback(
    async (email: string, password: string, name: string) => {
      if (isDemoMode) {
        setUser({ ...mockUser, email, name, avatarInitials: name.slice(0, 2).toUpperCase() });
        return {};
      }

      const { data, error } = await requireSupabase().auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (error) return { error: error.message };
      if (data.user) await loadUserFromSupabase(data.user);
      return {};
    },
    [isDemoMode, loadUserFromSupabase],
  );

  const resetPassword = useCallback(
    async (email: string) => {
      const normalizedEmail = email.trim();

      if (isDemoMode) {
        if (normalizedEmail !== DEMO_USER.email) {
          return { error: 'Email incorrecto. No hay ninguna cuenta registrada con ese correo.' };
        }
        return { success: true };
      }

      const check = await checkEmailRegistered(normalizedEmail);
      if (check.status === 'not_registered') {
        return { error: 'Email incorrecto. No hay ninguna cuenta registrada con ese correo.' };
      }

      const redirectTo = getPasswordResetRedirectUrl();
      const { error } = await requireSupabase().auth.resetPasswordForEmail(normalizedEmail, { redirectTo });

      if (error) {
        return { error: mapResetPasswordError(error.message) };
      }

      return { success: true };
    },
    [isDemoMode],
  );

  const signOut = useCallback(async () => {
    if (!isDemoMode) {
      await requireSupabase().auth.signOut({ scope: 'local' });
    }
    setUser(null);
  }, [isDemoMode]);

  const refreshUser = useCallback(async () => {
    if (isDemoMode) return;

    const supabase = getSupabase();
    if (!supabase) return;

    const { data } = await supabase.auth.getSession();
    if (data.session?.user && !hasRecoveryUrlParams()) {
      await loadUserFromSupabase(data.session.user);
    }
  }, [isDemoMode, loadUserFromSupabase]);

  const finishActiveProgram = useCallback(
    async (programId: string) => {
      const activePrograms = user?.currentPrograms ?? (user?.currentProgram ? [user.currentProgram] : []);
      const program = activePrograms.find((item) => item.id === programId);

      if (!program) {
        return { error: 'No hay programación activa' };
      }

      if (isDemoMode) {
        const remaining = activePrograms.filter((item) => item.id !== programId);
        setUser({
          ...user!,
          currentPrograms: remaining,
          currentProgram: remaining[0],
          currentProgramId: remaining[0]?.id,
        });
        return {};
      }

      const { error } = await finishUserProgram(user!.id, programId);
      if (error) {
        return { error };
      }

      await refreshUser();
      return {};
    },
    [isDemoMode, user, refreshUser],
  );

  const updateProfile = useCallback(
    async (updates: ProfileUpdates) => {
      if (!user) {
        return { error: 'No hay sesión activa' };
      }

      if (isDemoMode) {
        const name = updates.name.trim();
        setUser({
          ...user,
          ...updates,
          name,
          avatarInitials: name
            .split(' ')
            .map((part) => part[0])
            .join('')
            .slice(0, 2)
            .toUpperCase(),
        });
        return {};
      }

      const { error, profile } = await updateUserProfile(user.id, user.email, updates);
      if (error) {
        return { error };
      }

      if (profile) {
        setUser(profile);
      } else {
        await refreshUser();
      }

      return {};
    },
    [isDemoMode, user, refreshUser],
  );

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isDemoMode,
      signIn,
      signUp,
      resetPassword,
      updateProfile,
      refreshUser,
      finishActiveProgram,
      signOut,
    }),
    [
      user,
      isLoading,
      isDemoMode,
      signIn,
      signUp,
      resetPassword,
      updateProfile,
      refreshUser,
      finishActiveProgram,
      signOut,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

function mapSignInError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes('email not confirmed')) {
    return 'Tu email aún no está confirmado. Revisa tu bandeja de entrada (y spam) y haz clic en el enlace de confirmación.';
  }

  if (normalized.includes('invalid login credentials')) {
    return 'Email o contraseña incorrectos.';
  }

  return message;
}

function mapResetPasswordError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes('rate limit')) {
    return 'Has superado el límite de envíos de Supabase. Espera unos minutos e inténtalo de nuevo.';
  }

  if (normalized.includes('invalid email')) {
    return 'El email no es válido.';
  }

  return message;
}

function mapSupabaseUserFallback(authUser: User): UserProfile {
  const name = (authUser.user_metadata?.name as string) ?? 'Usuario';
  return {
    id: authUser.id,
    name,
    email: authUser.email ?? '',
    avatarInitials: name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
  };
}
