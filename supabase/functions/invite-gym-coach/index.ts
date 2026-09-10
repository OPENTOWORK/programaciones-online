import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const WEB_LOGIN_URL = "https://trainingprogline.es";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InviteCoachBody {
  gymId?: string;
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
}

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function generatePassword() {
  const alphabet = "abcdefghijkmnpqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return `Hype-${[...bytes].map((byte) => alphabet[byte % alphabet.length]).join("")}`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function buildInviteSubject(gymName: string) {
  return `Te han dado acceso al panel de ${gymName}`;
}

function buildInviteText(input: {
  name: string;
  gymName: string;
  email: string;
  password?: string;
  alreadyExisted: boolean;
}) {
  const displayName = input.name.trim() || "entrenador/a";
  const passwordBlock = input.alreadyExisted
    ? "Entra con la contraseña que ya usas en Training ProgLine."
    : `Tu contraseña temporal es: ${input.password ?? ""}

Te recomendamos cambiarla cuando entres.`;

  return `Hola, ${displayName}.

${input.gymName} te ha añadido como entrenador/a en Training ProgLine.

Entra en ${WEB_LOGIN_URL} con este email (${input.email}) y podrás gestionar los entrenamientos y las tareas del gimnasio.

${passwordBlock}

¡Nos vemos dentro!`;
}

function buildInviteHtml(input: {
  name: string;
  gymName: string;
  email: string;
  password?: string;
  alreadyExisted: boolean;
}) {
  const displayName = escapeHtml(input.name.trim() || "entrenador/a");
  const gymName = escapeHtml(input.gymName);
  const email = escapeHtml(input.email);
  const password = input.password ? escapeHtml(input.password) : "";
  const passwordBlock = input.alreadyExisted
    ? "<p>Entra con la contraseña que ya usas en Training ProgLine.</p>"
    : `<p>Tu contraseña temporal es: <strong>${password}</strong></p>
       <p>Te recomendamos cambiarla cuando entres.</p>`;

  return `<!DOCTYPE html>
<html lang="es">
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827; background: #f8fafc; padding: 24px;">
    <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 28px; border: 1px solid #e5e7eb;">
      <h1 style="margin: 0 0 16px; font-size: 24px;">Hola, ${displayName}</h1>
      <p><strong>${gymName}</strong> te ha añadido como entrenador/a en <strong>Training ProgLine</strong>.</p>
      <p>Entra en <a href="${WEB_LOGIN_URL}" style="color: #e85d4c;">${WEB_LOGIN_URL}</a> con este email (${email}) y podrás gestionar los entrenamientos y las tareas del gimnasio.</p>
      ${passwordBlock}
      <p style="margin-top: 24px;">¡Nos vemos dentro!</p>
    </div>
  </body>
</html>`;
}

async function sendViaResend(input: {
  email: string;
  name: string;
  gymName: string;
  password?: string;
  alreadyExisted: boolean;
}) {
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
      to: [input.email],
      subject: buildInviteSubject(input.gymName),
      html: buildInviteHtml(input),
      text: buildInviteText(input),
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("Resend error:", detail);
    return false;
  }

  return true;
}

async function sendViaSupabaseInvite(
  supabaseUrl: string,
  serviceKey: string,
  email: string,
) {
  const response = await fetch(`${supabaseUrl}/auth/v1/invite`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({
      email,
      data: { invited_as: "gym_coach" },
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("Supabase invite error:", detail);
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

  let body: InviteCoachBody;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Cuerpo de la petición inválido." }, 400);
  }

  const gymId = body.gymId?.trim() ?? "";
  const name = body.name?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";
  const phone = body.phone?.trim() ?? "";
  const password = body.password?.trim() || generatePassword();

  if (!gymId) return json({ error: "Falta el gimnasio." }, 400);
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

  const { data: canManage, error: manageError } = await userClient.rpc("can_manage_gym", {
    target_gym: gymId,
  });
  if (manageError || !canManage) {
    return json({ error: "Solo el propietario o un gerente pueden invitar entrenadores." }, 403);
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: gym, error: gymError } = await admin
    .from("gyms")
    .select("id, name")
    .eq("id", gymId)
    .maybeSingle();

  if (gymError || !gym?.id) {
    return json({ error: "No se encontró el gimnasio." }, 404);
  }

  const { data: roleRows, error: rolesError } = await admin
    .from("roles")
    .select("id, slug")
    .in("slug", ["gimnasio", "atleta", "entrenador", "administrador"]);

  if (rolesError || !roleRows?.length) {
    return json({ error: "No se pudieron cargar los roles." }, 500);
  }

  const roleIdBySlug = new Map(roleRows.map((row) => [row.slug as string, row.id as string]));
  const gymRoleId = roleIdBySlug.get("gimnasio");
  if (!gymRoleId) {
    return json({ error: "No se encontró el rol de gimnasio." }, 500);
  }

  const { data: existingProfile } = await admin
    .from("Perfil")
    .select("id, name, email, id_roles")
    .ilike("email", email)
    .maybeSingle();

  let userId = existingProfile?.id as string | undefined;
  let alreadyExisted = Boolean(userId);

  if (userId) {
    const { data: membership } = await admin
      .from("gym_users")
      .select("id, role")
      .eq("gym_id", gymId)
      .eq("user_id", userId)
      .maybeSingle();

    if (membership?.id) {
      return json({ error: "Esta persona ya está en el equipo del gimnasio." }, 409);
    }

    const existingRoleSlug = roleRows.find((row) => row.id === existingProfile?.id_roles)?.slug;
    if (existingRoleSlug === "entrenador" || existingRoleSlug === "administrador") {
      return json({
        error:
          "Esta cuenta ya pertenece al equipo de Training ProgLine. Contacta con nosotros para darle acceso al gimnasio.",
      }, 409);
    }
  } else {
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        phone: phone || undefined,
        invited_as: "gym_coach",
      },
    });

    if (createError) {
      const message = createError.message.toLowerCase();
      if (message.includes("already") || message.includes("registered")) {
        return json({
          error: "Este email ya está registrado. Prueba de nuevo o contacta con Training ProgLine.",
        }, 409);
      }
      return json({ error: createError.message }, 400);
    }

    userId = created.user?.id;
    if (!userId) {
      return json({ error: "No se pudo crear la cuenta del entrenador." }, 500);
    }
  }

  const { error: profileError } = await admin.from("Perfil").upsert(
    {
      id: userId,
      name,
      email,
      id_roles: gymRoleId,
    },
    { onConflict: "id" },
  );

  if (profileError) {
    return json({ error: "No se pudo preparar el perfil del entrenador." }, 500);
  }

  const { error: membershipError } = await admin.from("gym_users").insert({
    gym_id: gymId,
    user_id: userId,
    role: "coach",
  });

  if (membershipError) {
    return json({ error: "No se pudo añadir al entrenador al gimnasio." }, 500);
  }

  await admin.from("gym_admin_activity").insert({
    gym_id: gymId,
    actor_user_id: authData.user.id,
    action: "coach_invited",
    detail: email,
  });

  const invitePayload = {
    email,
    name,
    gymName: (gym.name as string) || "tu gimnasio",
    password: alreadyExisted ? undefined : password,
    alreadyExisted,
  };

  let welcomeEmailSent = await sendViaResend(invitePayload);
  if (!welcomeEmailSent && !alreadyExisted) {
    welcomeEmailSent = await sendViaSupabaseInvite(supabaseUrl, serviceKey, email);
  }

  return json({
    userId,
    alreadyExisted,
    welcomeEmailSent,
    temporaryPassword: welcomeEmailSent || alreadyExisted ? undefined : password,
  });
});
