import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MODELS = ["gpt-image-1.5", "gpt-image-1"];

const THEME_BACKGROUNDS: Record<string, { label: string; background: string }> = {
  day: {
    label: "Día",
    background: "fondo de estudio claro en gris perla (#F4F6F9), luz suave de día, ambiente limpio y luminoso",
  },
  night: {
    label: "Noche",
    background: "fondo de estudio oscuro carbón (#0F1419), luz lateral suave, ambiente premium nocturno",
  },
  navy: {
    label: "Azul",
    background: "fondo degradado azul marino profundo (#0C1A2E a #13253F), luz de estudio fría y elegante",
  },
  forest: {
    label: "Verde",
    background: "fondo verde bosque oscuro (#0D1A10 a #152A18), luz natural suave, ambiente orgánico premium",
  },
  sand: {
    label: "Arena",
    background: "fondo cálido arena y beige oscuro (#141210 a #1C1A16), luz cálida de estudio",
  },
  slate: {
    label: "Niebla",
    background: "fondo gris pizarra oscuro (#131518 a #1A1D21), luz difusa minimalista",
  },
  teal: {
    label: "Agua",
    background: "fondo verde azulado profundo (#0E1617 a #151F21), luz fresca de estudio",
  },
  wine: {
    label: "Rosa",
    background: "fondo vino oscuro con matiz rosa (#1A1016 a #281820), luz suave y sofisticada",
  },
  lavender: {
    label: "Lavanda",
    background: "fondo púrpura lavanda oscuro (#15101E a #201830), luz suave de estudio",
  },
  olive: {
    label: "Oliva",
    background: "fondo verde oliva oscuro (#12140E a #1A1E14), luz cálida natural",
  },
  rose: {
    label: "Rosa claro",
    background: "fondo rosa empolvado oscuro (#181012 a #241820), luz cálida suave",
  },
};

function inferCategory(name: string) {
  const normalized = name.toLowerCase();
  if (normalized.includes("bono") || normalized.includes("drop in") || normalized.includes("staff")) {
    return "service";
  }
  if (
    normalized.includes("batido") ||
    normalized.includes("agua") ||
    normalized.includes("red bull") ||
    normalized.includes("vitamin well") ||
    normalized.includes("barrita") ||
    normalized.includes("chocolatina")
  ) {
    return "beverage";
  }
  if (
    normalized.includes("shirt") ||
    normalized.includes("t-shirt") ||
    normalized.includes("leggin") ||
    normalized.includes("legging") ||
    normalized.includes("sudadera") ||
    normalized.includes("crop top") ||
    normalized.includes("hybrid") ||
    normalized.includes("minimal") ||
    normalized.includes("short") ||
    normalized.includes("calcetines") ||
    normalized.includes("gorra") ||
    normalized.includes("gorro")
  ) {
    return "apparel";
  }
  if (
    normalized.includes("comba") ||
    normalized.includes("calleras") ||
    normalized.includes("cinturon") ||
    normalized.includes("munequeras") ||
    normalized.includes("muñequeras") ||
    normalized.includes("foam roller") ||
    normalized.includes("lija")
  ) {
    return "equipment";
  }
  if (
    normalized.includes("belevels") ||
    normalized.includes("qns") ||
    normalized.includes("vitamina") ||
    normalized.includes("creatina") ||
    normalized.includes("magnesio") ||
    normalized.includes("magnesium") ||
    normalized.includes("omega") ||
    normalized.includes("eaas") ||
    normalized.includes("carnitina") ||
    normalized.includes("crema") ||
    normalized.includes("protein") ||
    normalized.includes("colageno")
  ) {
    return "supplement";
  }
  return "accessory";
}

const CATEGORY_SHOT: Record<string, string> = {
  supplement: "Bote o bote de suplemento deportivo premium, etiqueta limpia sin texto legible",
  apparel: "Prenda deportiva doblada o en plano, textura visible, estilo ecommerce premium",
  equipment: "Material de entrenamiento aislado, acabado realista y detallado",
  beverage: "Botella o envase de bebida fría, gotas sutiles, estilo catálogo premium",
  accessory: "Accesorio de gimnasio o lifestyle sport, composición centrada y elegante",
  service: "Tarjeta o pase de servicio abstracto sin texto legible, estilo premium minimal",
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  const chunk = 0x8000;
  for (let index = 0; index < bytes.length; index += chunk) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunk));
  }
  return btoa(binary);
}

function buildPrompt(name: string, description?: string, themeId = "night") {
  const theme = THEME_BACKGROUNDS[themeId] ?? THEME_BACKGROUNDS.night;
  const category = inferCategory(name);
  const detail = description?.trim() ? ` Detalles del producto: ${description.trim()}.` : "";

  return [
    "Fotografía profesional de producto para ecommerce de gimnasio, fotorealista, 1:1.",
    `Producto: ${name.trim()}.${detail}`,
    CATEGORY_SHOT[category],
    `Fondo: ${theme.background}.`,
    "Iluminación de estudio suave, sombras realistas, producto centrado, nítido, composición limpia.",
    "Sin texto, sin logotipos inventados, sin marcas de agua, sin personas, sin manos.",
  ].join(" ");
}

async function generateWithOpenAI(apiKey: string, prompt: string) {
  let lastError = "No se pudo generar la imagen.";

  for (const model of MODELS) {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        prompt,
        n: 1,
        size: "1024x1024",
      }),
    });

    const payload = await response.json() as {
      data?: Array<{ b64_json?: string; url?: string }>;
      error?: { message?: string };
    };

    if (!response.ok) {
      lastError = payload.error?.message ?? `OpenAI ${response.status}`;
      if (/model|not found|does not exist|unsupported/i.test(lastError)) continue;
      throw new Error(lastError);
    }

    const image = payload.data?.[0];
    if (image?.b64_json) {
      return { imageBase64: image.b64_json, mimeType: "image/png" };
    }

    if (image?.url) {
      const file = await fetch(image.url);
      if (!file.ok) throw new Error("No se pudo descargar la imagen generada.");
      const bytes = new Uint8Array(await file.arrayBuffer());
      const mimeType = file.headers.get("content-type") || "image/png";
      return { imageBase64: bytesToBase64(bytes), mimeType };
    }
  }

  throw new Error(lastError);
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const openaiKey = Deno.env.get("OPENAI_API_KEY")?.trim();
    if (!openaiKey) {
      return json({ error: "ChatGPT no está configurado. Falta OPENAI_API_KEY en el servidor." }, 500);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const authHeader = request.headers.get("Authorization") ?? "";

    const supabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return json({ error: "Inicia sesión para generar la imagen." }, 401);
    }

    const body = await request.json() as {
      gymId?: string;
      name?: string;
      description?: string;
      themeId?: string;
    };
    const gymId = body.gymId?.trim() ?? "";
    const name = body.name?.trim() ?? "";
    const themeId = body.themeId?.trim() || "night";
    if (!gymId) return json({ error: "Falta el gimnasio." }, 400);
    if (!name) return json({ error: "Escribe el nombre del producto para generar la imagen." }, 400);

    const { data: allowed, error: permissionError } = await supabase.rpc("can_manage_gym", {
      target_gym: gymId,
    });
    if (permissionError) return json({ error: permissionError.message }, 400);
    if (!allowed) {
      return json({ error: "Solo el dueño o un manager puede generar imágenes." }, 403);
    }

    const image = await generateWithOpenAI(
      openaiKey,
      buildPrompt(name, body.description, themeId),
    );
    return json(image);
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo generar la imagen.";
    return json({ error: message }, 500);
  }
});
