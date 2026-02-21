const SYSTEM_PROMPT = `You are Kora AI, a smart banking assistant for Kodbank users.
You help users understand banking concepts, savings tips, account usage,
transactions, budgeting, and financial advice in simple language.`;

// New HuggingFace Inference Providers (router) - OpenAI-compatible
const HF_CHAT_URL = 'https://router.huggingface.co/v1/chat/completions';
const HF_MODEL = 'mistralai/Mistral-7B-Instruct-v0.2';

async function chat(req, res) {
  try {
    const { message } = req.body;
    const apiKey = process.env.HF_API_KEY;

    if (!apiKey) {
      return res.status(503).json({
        success: false,
        reply: 'Kora AI is not configured. Please set HF_API_KEY.',
      });
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        reply: 'Please send a non-empty message.',
      });
    }

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: message.trim() },
    ];

    let response = await fetch(HF_CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: HF_MODEL,
        messages,
        max_tokens: 256,
        temperature: 0.7,
      }),
    });

    // Retry once if model is loading (503)
    if (response.status === 503) {
      await new Promise((r) => setTimeout(r, 3000));
      response = await fetch(HF_CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: HF_MODEL,
          messages,
          max_tokens: 256,
          temperature: 0.7,
        }),
      });
    }

    if (!response.ok) {
      const errText = await response.text();
      console.error('HuggingFace API error:', response.status, errText);
      let userMessage = 'Kora AI is temporarily unavailable. Please try again later.';
      if (response.status === 401) {
        userMessage = 'Kora AI is not configured. Please set a valid HF_API_KEY in the backend.';
      } else if (response.status === 503) {
        userMessage = 'Kora AI is waking up. Please wait a moment and try again.';
      } else if (response.status === 418) {
        userMessage = 'Kora AI service was updated. Please restart the backend and try again.';
      }
      return res.status(502).json({
        success: false,
        reply: userMessage,
      });
    }

    const data = await response.json();

    let reply = '';
    if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      reply = data.choices[0].message.content.trim();
    }

    if (!reply) {
      reply = "I couldn't generate a response. Please try rephrasing your question.";
    }

    res.json({ reply });
  } catch (err) {
    console.error('AI chat error:', err);
    res.status(500).json({
      success: false,
      reply: 'Something went wrong. Please try again.',
    });
  }
}

module.exports = { chat };
