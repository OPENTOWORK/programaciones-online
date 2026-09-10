import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WellhubMemberBody {
  gymId?: string;
  secret?: string;
  wellhubUserId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "METHOD_NOT_ALLOWED" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return json({ error: "SERVER_MISCONFIGURED" }, 500);
  }

  let body: WellhubMemberBody;
  try {
    body = await req.json();
  } catch {
    return json({ error: "INVALID_JSON" }, 400);
  }

  const gymId = body.gymId?.trim();
  const secret = body.secret?.trim();
  const wellhubUserId = body.wellhubUserId?.trim();
  const firstName = body.firstName?.trim();
  const lastName = body.lastName?.trim() ?? "";
  const email = body.email?.trim() || null;
  const phone = body.phone?.trim() || null;

  if (!gymId || !secret || !wellhubUserId || !firstName) {
    return json({ error: "MISSING_FIELDS" }, 400);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.rpc("upsert_wellhub_gym_member", {
    target_gym: gymId,
    webhook_secret: secret,
    wellhub_user: wellhubUserId,
    first_name: firstName,
    last_name: lastName,
    member_email: email,
    member_phone: phone,
  });

  if (error) {
    const message = error.message ?? "UNKNOWN_ERROR";
    if (message.includes("INVALID_WEBHOOK_SECRET")) {
      return json({ error: "INVALID_WEBHOOK_SECRET" }, 401);
    }
    if (message.includes("WELLHUB_USER_REQUIRED")) {
      return json({ error: "WELLHUB_USER_REQUIRED" }, 400);
    }
    return json({ error: message }, 500);
  }

  return json({ memberId: data });
});
