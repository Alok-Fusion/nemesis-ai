const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Workaround for using node-fetch v3 in CommonJS
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

let conversationContext = ""; // Context to track the debate

app.post('/debate', async (req, res) => {
  const { belief } = req.body;

  // Append to conversation history
  conversationContext += `User: ${belief}\nNemesis:`;

  const prompt = `
You are NemesisAI 💀 — a ruthless debate expert.

Ongoing Debate:
${conversationContext}

💥 Respond with 2-3 short, aggressive, logical counter-arguments.
No long explanations. Use punchy bullet points only. Be bold, critical, and direct.
`;

  console.log('👉 Final prompt to Mistral:\n', prompt);

  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'mistral',
        prompt: prompt,
        stream: false,
      }),
    });

    const data = await response.json();

    if (!data || !data.response) {
      console.log('❌ Missing response from Mistral');
      return res.status(500).json({ reply: ['Nemesis is confused. Try again.'] });
    }

    // ✂️ Clean and split the response into punchy lines
    const formatted = data.response
      .split(/\n|•|[-–—]/)
      .map(line => line.trim())
      .filter(line => line.length > 0);

    // Add Nemesis response to conversation context
    conversationContext += formatted.join('\n') + '\n';

    console.log('🎯 Formatted response:', formatted);
    res.json({ reply: formatted });
  } catch (err) {
    console.error('🔥 Error from Mistral:', err);
    res.status(500).json({ reply: ['Nemesis crashed. Try again later.'] });
  }
});

app.listen(PORT, () => {
  console.log(`NemesisAI backend running on http://localhost:${PORT}`);
});
