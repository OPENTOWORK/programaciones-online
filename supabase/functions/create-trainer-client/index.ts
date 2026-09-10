import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const WEB_LOGIN_URL = "https://trainingprogline.es";
const EMAIL_CONFIRM_PATH = "/auth/confirm-email";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateClientBody {
  name?: string;
  email?: string;
  password?: string;
}

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function buildWelcomeSubject(name: string) {
  const displayName = name.trim() || "atleta";
  return `¡Bienvenido/a a Training Progline, ${displayName}!`;
}

function buildWelcomeText(name: string) {
  const displayName = name.trim() || "atleta";
  return `¡Hola, ${displayName}!

Tu entrenador ha creado tu cuenta en Training Progline.

Entra en ${WEB_LOGIN_URL} con tu email y la contraseña que te ha facilitado tu entrenador.

Si necesitas la app móvil, descárgala desde Google Play buscando "Training Progline".

¡Nos vemos dentro!
Carlos — Training Progline`;
}

function buildWelcomeHtml(name: string) {
  const displayName = name.trim() || "atleta";
  const text = buildWelcomeText(name);

  return `<!DOCTYPE html>
<html lang="es">
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827; background: #f8fafc; padding: 24px;">
    <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 28px; border: 1px solid #e5e7eb;">
      <h1 style="margin: 0 0 16px; font-size: 24px;">¡Bienvenido/a, ${displayName}!</h1>
      <p>Tu entrenador ha creado tu cuenta en <strong>Training Progline</strong>.</p>
      <p>Entra en <a href="${WEB_LOGIN_URL}" style="color: #e85d4c;">${WEB_LOGIN_URL}</a> con tu email y la contraseña que te ha facilitado tu entrenador.</p>
      <p>Si necesitas la app móvil, descárgala desde Google Play buscando <strong>Training Progline</strong>.</p>
      <p style="margin-top: 24px;">¡Nos vemos dentro!<br/>Carlos — Training Progline</p>
      <p style="margin-top: 24px; font-size: 12px; color: #6b7280; white-space: pre-line;">${text}</p>
    </div>
  </body>
</html>`;
}

async function sendViaResend(email: string, name: string) {
  const resendKey = Deno.env.get("RESEND_API_KEY")?.trim();
  if (!resendKey) return false;

  const from = Deno.env.get("WELCOME_EMAIL_FROM")?.trim() ??
    "Training ProgLine <onboarding@resend.dev>";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: buildWelcomeSubject(name),
      html: buildWelcomeHtml(name),
      text: buildWelcomeText(name),
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("Resend error:", detail);
    return false;
  }

  return true;
}

async function sendViaSupabaseSignupResend(
  supabaseUrl: string,
  serviceKey: string,
  email: string,
  redirectTo: string,
) {
  const response = await fetch(`${supabaseUrl}/auth/v1/resend`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({
      type: "signup",
      email,
      options: { email_redirect_to: redirectTo },
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("Supabase resend error:", detail);
    return false;
  }

  return true;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Método no permitido." }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")?.trim();

  if (!supabaseUrl || !serviceKey || !anonKey) {
    return json({ error: "Configuración del servidor incompleta." }, 500);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return json({ error: "No autorizado." }, 401);
  }

  let body: CreateClientBody;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Cuerpo de la petición inválido." }, 400);
  }

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";

  if (!name) return json({ error: "El nombre es obligatorio." }, 400);
  if (!email) return json({ error: "El email es obligatorio." }, 400);
  if (!/\S+@\S+\.\S+/.test(email)) return json({ error: "El email no es válido." }, 400);
  if (password.length < 6) {
    return json({ error: "La contraseña debe tener al menos 6 caracteres." }, 400);
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: authData, error: authError } = await userClient.auth.getUser();
  if (authError || !authData.user) {
    return json({ error: "No autorizado." }, 401);
  }

  const { data: isTrainer, error: roleError } = await userClient.rpc("is_entrenador");
  if (roleError || !isTrainer) {
    return json({ error: "Solo el equipo de entrenadores puede crear clientes." }, 403);
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: atletaRole } = await admin.from("roles").select("id").eq("slug", "atleta").maybeSingle();
  if (!atletaRole?.id) {
    return json({ error: "No se encontró el rol de atleta." }, 500);
  }

  const { data: existingProfile } = await admin
    .from("Perfil")
    .select("id")
    .eq("id_roles", atletaRole.id)
    .ilike("email", email)
    .maybeSingle();

  if (existingProfile?.id) {
    return json({ athleteId: existingProfile.id, alreadyExisted: true, welcomeEmailSent: false });
  }

  const hasResend = Boolean(Deno.env.get("RESEND_API_KEY")?.trim());
  const emailRedirectTo = `${WEB_LOGIN_URL}${EMAIL_CONFIRM_PATH}`;

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: hasResend,
    user_metadata: { name },
  });

  if (createError) {
    const message = createError.message.toLowerCase();
    if (message.includes("already") || message.includes("registered")) {
      const { data: registered } = await admin
        .from("Perfil")
        .select("id")
        .eq("id_roles", atletaRole.id)
        .ilike("email", email)
        .maybeSingle();

      if (registered?.id) {
        return json({ athleteId: registered.id, alreadyExisted: true, welcomeEmailSent: false });
      }

      return json({
        error: "Este email ya está registrado, pero no aparece como atleta en el tablero.",
      }, 409);
    }

    return json({ error: createError.message }, 400);
  }

  const athleteId = created.user?.id;
  if (!athleteId) {
    return json({ error: "No se pudo crear el cliente." }, 500);
  }

  let welcomeEmailSent = false;
  let needsEmailConfirmation = !hasResend;

  if (hasResend) {
    welcomeEmailSent = await sendViaResend(email, name);
  } else {
    welcomeEmailSent = await sendViaSupabaseSignupResend(
      supabaseUrl,
      serviceKey,
      email,
      emailRedirectTo,
    );
  }

  return json({
    athleteId,
    welcomeEmailSent,
    needsEmailConfirmation,
  });
});
