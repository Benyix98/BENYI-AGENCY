const ALLOWED_ORIGIN = "https://benyi-agency.pages.dev";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const N8N_WEBHOOK_URL = "https://main-production-55b1.up.railway.app/webhook/benia-lead";

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin");

    if (request.method === "OPTIONS") {
      if (origin !== ALLOWED_ORIGIN) {
        return new Response(null, { status: 403 });
      }
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (origin !== ALLOWED_ORIGIN) {
      return new Response(JSON.stringify({ error: "Origen no autorizado" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const rateLimitKey = `rl:${ip}`;
    const LIMIT = 5;
    const WINDOW = 600; // 10 minutos en segundos

    const current = parseInt((await env.RATE_LIMIT.get(rateLimitKey)) || "0");
    if (current >= LIMIT) {
      return new Response(JSON.stringify({ error: "Demasiadas solicitudes. Inténtalo en 10 minutos." }), {
        status: 429,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }
    await env.RATE_LIMIT.put(rateLimitKey, String(current + 1), { expirationTtl: WINDOW });

    const { company, email, goal } = await request.json();

    if (!company || !email || !goal) {
      return new Response(JSON.stringify({ error: "Faltan campos obligatorios" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    if (!email.includes("@")) {
      return new Response(JSON.stringify({ error: "El email no es válido" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    if (company.length > 25) {
      return new Response(JSON.stringify({ error: "El nombre de la empresa no puede superar los 25 caracteres" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const n8nRes = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company, email, goal }),
    });

    if (!n8nRes.ok) {
      return new Response(JSON.stringify({ error: "Error al procesar el lead" }), {
        status: 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  },
};
