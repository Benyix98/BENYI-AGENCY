const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// El chatbot llama a OpenAI (coste por petición). Limita el abuso: como
// máximo 15 mensajes cada 10 minutos por IP.
const chatLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas peticiones, inténtalo de nuevo en unos minutos.' },
});

// Límites de tamaño para evitar quemar tokens (coste) con entradas enormes.
const MAX_MESSAGES = 20;
const MAX_CHARS = 4000;

const SYSTEM_PROMPT = `Eres el asistente virtual de Benia Agency, una agencia especializada en automatizaciones con IA.
Ayudas a los visitantes a entender los servicios: automatizaciones, landings inteligentes, solución de problemas con IA y mentorías.
Responde de forma profesional, concisa y amigable en español.
Si el usuario pregunta por precios o quiere contratar, invítale a rellenar el formulario de contacto o a agendar una llamada.
No inventes precios específicos.`;

router.post('/', chatLimiter, async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Se requiere un array de mensajes' });
  }
  if (messages.length > MAX_MESSAGES) {
    return res.status(400).json({ error: 'Conversación demasiado larga' });
  }
  const valid = messages.every(
    (m) => m && typeof m.content === 'string' &&
      (m.role === 'user' || m.role === 'assistant')
  );
  if (!valid) {
    return res.status(400).json({ error: 'Formato de mensajes inválido' });
  }
  const totalChars = messages.reduce((n, m) => n + m.content.length, 0);
  if (totalChars > MAX_CHARS) {
    return res.status(400).json({ error: 'Mensaje demasiado largo' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      max_tokens: 500,
      temperature: 0.7,
    });

    res.json({ reply: completion.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al conectar con el chatbot' });
  }
});

module.exports = router;
