const { setGlobalOptions } = require("firebase-functions");
const { onRequest } = require("firebase-functions/https");
const { Resend } = require("resend");

setGlobalOptions({ maxInstances: 10 });

const resend = new Resend(process.env.RESEND_API_KEY);

exports.sendContactEmail = onRequest(async (req, res) => {
  // CORS
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { company, email, goal } = req.body;

  if (!company || !email || !goal) {
    res.status(400).json({ error: "Faltan campos obligatorios" });
    return;
  }

  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "livefordea4@gmail.com",
      subject: `Nuevo lead de ${company} — BENIA AGENCY`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #09090B; color: #fff; padding: 32px; border-radius: 12px; border: 1px solid rgba(34,197,94,0.3);">
          <h2 style="color: #22C55E; margin-bottom: 24px;">Nuevo contacto desde la web</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1); color: #9ca3af; width: 140px;">Empresa</td>
              <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1); font-weight: 600;">${company}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1); color: #9ca3af;">Email</td>
              <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1);"><a href="mailto:${email}" style="color: #22C55E;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 12px 0; color: #9ca3af; vertical-align: top;">Objetivo</td>
              <td style="padding: 12px 0;">${goal}</td>
            </tr>
          </table>
          <p style="margin-top: 32px; font-size: 12px; color: #6b7280;">BENIA AGENCY — Formulario de contacto web</p>
        </div>
      `,
    });

    res.status(200).json({ success: true, message: "Email enviado correctamente" });
  } catch (error) {
    console.error("Error enviando email:", error);
    res.status(500).json({ error: "Error al enviar el email" });
  }
});
