const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `Eres el asistente virtual de Benia Agency, una agencia especializada en automatizaciones con IA.
Ayudas a los visitantes a entender los servicios: automatizaciones, landings inteligentes, solución de problemas con IA y mentorías.
Responde de forma profesional, concisa y amigable en español.
Si el usuario pregunta por precios o quiere contratar, invítale a rellenar el formulario de contacto o a agendar una llamada.
No inventes precios específicos.`;

router.post('/', async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Se requiere un array de mensajes' });
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
