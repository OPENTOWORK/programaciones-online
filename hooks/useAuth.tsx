import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { User } from '@supabase/supabase-js';
import { Platform } from 'react-native';

import { checkEmailRegistered } from '@/lib/authService';
import { isJwtClockSkewError, jwtClockSkewUserMessage, recoverJwtClockSkew } from '@/lib/authSessionRecovery';
import { mapAuthException, mapSignInErrorMessage, signInWithPasswordSafe } from '@/lib/authErrors';
import {
  clearAuthCallbackParams,
  ensureAuthCallbackProcessed,
  getAuthCallbackFlowSnapshot,
  hasWebAuthCallback,
  parseAuthCallbackResult,
  resetAuthCallbackCoordinator,
} from '@/lib/authCallback';
import {
  getEmailConfirmationRedirectUrl,
  getInitialNativeAuthUrl,
  getPasswordResetRedirectUrl,
  isAuthCallbackDeepLink,
  isNativeAuthDeepLink,
  subscribeNativeAuthUrls,
} from '@/lib/authRedirect';
import { hasRecoveryUrlParams, setActiveRecoveryUrl } from '@/lib/recoverySession';
import { isAuthDemoMode, getSupabase, isSupabaseConfigured, requireSupabase } from '@/lib/supabase';
import {
  fetchUserProfileResult,
  updateUserProfile,
  type ProfileUpdates,
} from '@/lib/profileService';
import {
  isProfileReadyForNavigation,
  profileResultToUserMessage,
} from '@/lib/profileFetchResult';
import { finishUserProgram } from '@/lib/userProgramService';
import { sendSignupWelcomeMessage } from '@/lib/trainerService';
import { setDemoWelcomeMessage } from '@/lib/trainerWelcomeMessage';
import { interpretSignUpResponse, mapSignUpErrorMessage } from '@/lib/signUpResult';
import { createStaleRefresh } from '@/lib/staleRefresh';
import { logAuthEvent, logReleaseError } from '@/lib/releaseDiagnostics';
import { TimeoutError, withTimeout } from '@/lib/withTimeout';
import { DEMO_USER, DEMO_TRAINER, mockUser, mockTrainerUser } from '@/lib/mockData';
import type { UserProfile } from '@/lib/types';

const profileRefresh = createStaleRefresh(45_000);
const AUTH_INIT_TIMEOUT_MS = 20_000;
const PROFILE_LOAD_TIMEOUT_MS = 15_000;
const SIGN_IN_TIMEOUT_MS = 25_000;

interface AuthContextValue {
  user: UserProfile | null;
  isLoading: boolean;
  initError: string | null;
  profileError: string | null;
  isDemoMode: boolean;
  pendingAuthCallbackUrl: string | null;
  signIn: (email: string, password: string) => Promise<{ error?: string; profile?: UserProfile }>;
  signUp: (
    email: string,
    password: string,
    name: string,
  ) => Promise<{ error?: string; profile?: UserProfile; needsEmailConfirmation?: boolean }>;
  resetPassword: (email: string) => Promise<{ error?: string; success?: boolean }>;
  updateProfile: (updates: ProfileUpdates) => Promise<{ error?: string }>;
  refreshUser: (force?: boolean) => Promise<{ ok: boolean; error?: string; profile?: UserProfile } | undefined>;
  finishActiveProgram: (programId: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  retryInit: () => void;
  retryProfileLoad: () => Promise<void>;
  consumePendingAuthCallbackUrl: () => string | null;
  getAuthCallbackSnapshot: (url?: string | null) => ReturnType<typeof getAuthCallbackFlowSnapshot>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [initAttempt, setInitAttempt] = useState(0);
  const [pendingAuthCallbackUrl, setPendingAuthCallbackUrl] = useState<string | null>(null);
  const isDemoMode = isAuthDemoMode;
  const bootstrappedRef = useRef(false);
  const authListenerRef = useRef<{ unsubscribe: () => void } | null>(null);

  const loadUserFromSupabase = useCallback(async (authUser: User) => {
    const result = await withTimeout(
      fetchUserProfileResult(authUser.id),
      PROFILE_LOAD_TIMEOUT_MS,
      'Tiempo de espera agotado al cargar el perfil',
    );

    if (isProfileReadyForNavigation(result)) {
      setUser(result.profile);
      setProfileError(null);
      return { ok: true as const, profile: result.profile };
    }

    const message = profileResultToUserMessage(result);
    setUser(null);
    setProfileError(message);
    return { ok: false as const, error: message };
  }, []);

  const processAuthDeepLink = useCallback(
    async (url: string, supabase: NonNullable<ReturnType<typeof getSupabase>>) => {
      if (!url) {
        return;
      }

      if (!isAuthCallbackDeepLink(url) && Platform.OS !== 'web') {
        return;
      }

      const snapshot = getAuthCallbackFlowSnapshot(url);
      if (snapshot.status === 'success' || snapshot.status === 'error') {
        setPendingAuthCallbackUrl(url);
        if (url.includes('update-password')) {
          setActiveRecoveryUrl(url);
        }
        return;
      }

      setPendingAuthCallbackUrl(url);

      logAuthEvent('deep_link_received', {
        scheme: url.split(':')[0] ?? undefined,
        pathname: url.includes('confirm-email')
          ? '/auth/confirm-email'
          : url.includes('update-password')
            ? '/auth/update-password'
            : undefined,
      });

      if (url.includes('update-password')) {
        setActiveRecoveryUrl(url);
      }

      const result = await ensureAuthCallbackProcessed(supabase, url);
      if (!result.ok) {
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (data.session?.user && !hasRecoveryUrlParams(url)) {
        await loadUserFromSupabase(data.session.user);
      }
    },
    [loadUserFromSupabase],
  );

  useEffect(() => {
    if (isDemoMode || Platform.OS === 'web') {
      return;
    }

    let subscription: { remove: () => void } | undefined;

    void (async () => {
      const initialUrl = await getInitialNativeAuthUrl();
      const supabase = getSupabase();
      if (supabase && initialUrl) {
        await processAuthDeepLink(initialUrl, supabase);
      }
    })();

    subscription = subscribeNativeAuthUrls((url) => {
      const supabase = getSupabase();
      if (supabase) {
        void processAuthDeepLink(url, supabase);
      }
    });

    return () => {
      subscription?.remove();
    };
  }, [isDemoMode, processAuthDeepLink]);

  useEffect(() => {
    if (isDemoMode) {
      setIsLoading(false);
      setInitError(null);
      setProfileError(null);
      return;
    }

    let cancelled = false;

    async function init() {
      const isRetry = initAttempt > 0;
      if (!isRetry && bootstrappedRef.current) {
        return;
      }

      if (!bootstrappedRef.current || isRetry) {
        setIsLoading(true);
      }
      setInitError(null);
      logAuthEvent('init_start');

      try {
        const supabase = getSupabase();
        if (!supabase) {
          setInitError('Supabase no está disponible en este dispositivo.');
          return;
        }

        await withTimeout(
          (async () => {
            if (Platform.OS === 'web' && hasWebAuthCallback()) {
              const callback = parseAuthCallbackResult();
              if (callback.status === 'error') {
                return;
              }

              const result = await ensureAuthCallbackProcessed(supabase);
              if (result.ok) {
                const { data: confirmed } = await supabase.auth.getSession();
                if (confirmed.session?.user && !hasRecoveryUrlParams()) {
                  await loadUserFromSupabase(confirmed.session.user);
                }
                clearAuthCallbackParams();
              }
            }

            const { data, error } = await supabase.auth.getSession();
            if (error) {
              logAuthEvent('session_restore_error', { message: error.message }, 'warn');
              if (isJwtClockSkewError(error.message)) {
                await recoverJwtClockSkew(supabase);
              }
            }

            if (data.session?.user && !hasRecoveryUrlParams()) {
              logAuthEvent('session_restore_ok', { userId: data.session.user.id });
              await loadUserFromSupabase(data.session.user);
            } else {
              logAuthEvent('session_restore_empty');
              setUser(null);
              setProfileError(null);
            }
          })(),
          AUTH_INIT_TIMEOUT_MS,
          'Tiempo de espera agotado al restaurar la sesión',
        );

        if (cancelled) return;

        if (!authListenerRef.current) {
          const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
            logAuthEvent('state_change', { event, hasSession: Boolean(session?.user) });

            if (!session?.user) {
              if (event === 'PASSWORD_RECOVERY' || hasRecoveryUrlParams()) {
                return;
              }
              setUser(null);
              setProfileError(null);
              return;
            }

            if (event === 'PASSWORD_RECOVERY' || hasRecoveryUrlParams()) {
              return;
            }

            if (event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
              return;
            }

            try {
              await loadUserFromSupabase(session.user);
            } catch (error) {
              logReleaseError('auth_state_profile_failed', error, { event });
            }
          });
          authListenerRef.current = listener.subscription;
        }

        bootstrappedRef.current = true;
        logAuthEvent('init_done');
      } catch (error) {
        const message =
          error instanceof TimeoutError
            ? 'La conexión tardó demasiado. Comprueba tu red e inténtalo de nuevo.'
            : error instanceof Error
              ? error.message
              : 'No se pudo iniciar la sesión.';
        logReleaseError('init_failed', error);
        setInitError(message);
        setUser(null);
        setProfileError(null);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void init();

    return () => {
      cancelled = true;
    };
  }, [isDemoMode, loadUserFromSupabase, initAttempt]);

  useEffect(() => {
    return () => {
      authListenerRef.current?.unsubscribe();
      authListenerRef.current = null;
      bootstrappedRef.current = false;
    };
  }, []);

  const retryInit = useCallback(() => {
    bootstrappedRef.current = false;
    authListenerRef.current?.unsubscribe();
    authListenerRef.current = null;
    setInitAttempt((attempt) => attempt + 1);
  }, []);

  const retryProfileLoad = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) return;

    setIsLoading(true);
    setProfileError(null);

    try {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        await loadUserFromSupabase(data.session.user);
      } else {
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [loadUserFromSupabase]);

  const getAuthCallbackSnapshot = useCallback((url?: string | null) => {
    return getAuthCallbackFlowSnapshot(url ?? pendingAuthCallbackUrl);
  }, [pendingAuthCallbackUrl]);

  const consumePendingAuthCallbackUrl = useCallback(() => {
    const url = pendingAuthCallbackUrl;
    setPendingAuthCallbackUrl(null);
    return url;
  }, [pendingAuthCallbackUrl]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const normalizedEmail = email.trim().toLowerCase();

      if (isSupabaseConfigured) {
        logAuthEvent('sign_in_start');
        setProfileError(null);

        try {
          const { data, error } = await withTimeout(
            signInWithPasswordSafe(requireSupabase(), {
              email: normalizedEmail,
              password,
            }),
            SIGN_IN_TIMEOUT_MS,
            'Tiempo de espera agotado al iniciar sesión',
          );

          if (error) {
            logAuthEvent('sign_in_failed', { reason: mapSignInErrorMessage(error.message) }, 'warn');
            return { error: mapSignInErrorMessage(error.message) };
          }

          if (data.user) {
            const loaded = await loadUserFromSupabase(data.user);
            if (!loaded.ok) {
              return { error: loaded.error };
            }
            logAuthEvent('sign_in_ok', { userId: data.user.id });
            return { profile: loaded.profile };
          }

          return { error: 'No se pudo completar el inicio de sesión.' };
        } catch (error) {
          logReleaseError('sign_in_exception', error);
          if (error instanceof TimeoutError) {
            return { error: 'La conexión tardó demasiado. Comprueba tu red e inténtalo de nuevo.' };
          }
          return { error: mapAuthException(error) };
        }
      }

      if (isDemoMode) {
        if (normalizedEmail === DEMO_USER.email && password === DEMO_USER.password) {
          setUser(mockUser);
          setProfileError(null);
          return { profile: mockUser };
        }
        if (normalizedEmail === DEMO_TRAINER.email && password === DEMO_TRAINER.password) {
          setUser(mockTrainerUser);
          setProfileError(null);
          return { profile: mockTrainerUser };
        }
        return {
          error:
            'Credenciales incorrectas. Usa demo@programaciones.online o entrenador@programaciones.online / demo1234',
        };
      }

      return { error: 'Supabase no está configurado en este entorno.' };
    },
    [isDemoMode, loadUserFromSupabase],
  );

  const signUp = useCallback(
    async (email: string, password: string, name: string) => {
      if (isDemoMode) {
        const profile = { ...mockUser, email, name, avatarInitials: name.slice(0, 2).toUpperCase() };
        setDemoWelcomeMessage(profile.id, name);
        setUser(profile);
        setProfileError(null);
        return { profile };
      }

      try {
        const { data, error } = await withTimeout(
          requireSupabase().auth.signUp({
            email,
            password,
            options: {
              data: { name },
              emailRedirectTo: getEmailConfirmationRedirectUrl(),
            },
          }),
          SIGN_IN_TIMEOUT_MS,
          'Tiempo de espera agotado al registrarse',
        );

        if (error) {
          logAuthEvent('sign_up_failed', { reason: mapSignUpErrorMessage(error.message) }, 'warn');
          return { error: mapSignUpErrorMessage(error.message) };
        }

        const interpretation = interpretSignUpResponse(data);
        logAuthEvent('sign_up_result', {
          result: interpretation.type,
          hasSession: Boolean(data.session),
          identityCount: data.user?.identities?.length ?? 0,
        });

        if (interpretation.type === 'already_registered') {
          return {
            error:
              'Este email ya está registrado. Inicia sesión. Si no confirmaste el email, usa "Reenviar" en confirmación o recuperar contraseña.',
          };
        }

        if (interpretation.type === 'needs_email_confirmation') {
          return { needsEmailConfirmation: true };
        }

        if (interpretation.type === 'session_created' && data.user) {
          const loaded = await loadUserFromSupabase(data.user);
          if (!loaded.ok) {
            return { error: loaded.error };
          }

          const welcome = await sendSignupWelcomeMessage(data.user.id, name);
          if (!welcome.ok) {
            logAuthEvent('sign_up_welcome_failed', { reason: welcome.error }, 'warn');
          }

          return { profile: loaded.profile };
        }
        return { error: 'No se pudo completar el registro. Inténtalo de nuevo.' };
      } catch (error) {
        logReleaseError('sign_up_exception', error);
        return { error: mapAuthException(error) };
      }
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

      try {
        const check = await checkEmailRegistered(normalizedEmail);
        if (check.status === 'not_registered') {
          return { error: 'Email incorrecto. No hay ninguna cuenta registrada con ese correo.' };
        }

        const redirectTo = getPasswordResetRedirectUrl();
        const { error } = await withTimeout(
          requireSupabase().auth.resetPasswordForEmail(normalizedEmail, { redirectTo }),
          SIGN_IN_TIMEOUT_MS,
          'Tiempo de espera agotado al enviar el correo',
        );

        if (error) {
          return { error: mapResetPasswordError(error.message) };
        }

        return { success: true };
      } catch (error) {
        logReleaseError('reset_password_exception', error);
        return { error: mapAuthException(error) };
      }
    },
    [isDemoMode],
  );

  const signOut = useCallback(async () => {
    if (!isDemoMode) {
      try {
        await requireSupabase().auth.signOut({ scope: 'local' });
      } catch (error) {
        logReleaseError('sign_out_failed', error);
      }
    }
    setUser(null);
    setProfileError(null);
    setPendingAuthCallbackUrl(null);
    bootstrappedRef.current = false;
    authListenerRef.current?.unsubscribe();
    authListenerRef.current = null;
    resetAuthCallbackCoordinator();
  }, [isDemoMode]);

  const userRef = useRef(user);
  const profileErrorRef = useRef(profileError);
  userRef.current = user;
  profileErrorRef.current = profileError;

  const refreshUser = useCallback(async (force = false) => {
    if (isDemoMode) return { ok: true as const };

    const supabase = getSupabase();
    if (!supabase) return { ok: false as const, error: 'Supabase no está disponible.' };
    if (!profileRefresh.shouldRefresh(force)) {
      const currentUser = userRef.current;
      const currentProfileError = profileErrorRef.current;
      if (currentUser && !currentProfileError) {
        return { ok: true as const, profile: currentUser };
      }
      if (currentProfileError) {
        return { ok: false as const, error: currentProfileError };
      }
      return undefined;
    }

    try {
      return await profileRefresh.track(
        (async () => {
          const { data } = await supabase.auth.getSession();
          if (data.session?.user && !hasRecoveryUrlParams()) {
            return loadUserFromSupabase(data.session.user);
          }
          return { ok: false as const, error: 'No hay sesión activa.' };
        })(),
      );
    } catch (error) {
      logReleaseError('refresh_user_failed', error);
      return {
        ok: false as const,
        error: error instanceof Error ? error.message : 'No se pudo cargar el perfil.',
      };
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

      await refreshUser(true);
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
        const { calculateBmi } = await import('@/lib/bodyMetrics');
        const height = 'height' in updates ? updates.height : user.height;
        const weight = 'weight' in updates ? updates.weight : user.weight;
        setUser({
          ...user,
          ...updates,
          name,
          height,
          weight,
          bmi: calculateBmi(height, weight),
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
        await refreshUser(true);
      }

      return {};
    },
    [isDemoMode, user, refreshUser],
  );

  const value = useMemo(
    () => ({
      user,
      isLoading,
      initError,
      profileError,
      isDemoMode,
      pendingAuthCallbackUrl,
      signIn,
      signUp,
      resetPassword,
      updateProfile,
      refreshUser,
      finishActiveProgram,
      signOut,
      retryInit,
      retryProfileLoad,
      consumePendingAuthCallbackUrl,
      getAuthCallbackSnapshot,
    }),
    [
      user,
      isLoading,
      initError,
      profileError,
      isDemoMode,
      pendingAuthCallbackUrl,
      signIn,
      signUp,
      resetPassword,
      updateProfile,
      refreshUser,
      finishActiveProgram,
      signOut,
      retryInit,
      retryProfileLoad,
      consumePendingAuthCallbackUrl,
      getAuthCallbackSnapshot,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

function mapSignUpError(message: string) {
  return mapSignUpErrorMessage(message);
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
