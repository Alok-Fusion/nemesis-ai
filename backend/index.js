const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Use node-fetch for API calls
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

let conversationContext = ""; // Context to track the debate

app.post('/debate', async (req, res) => {
  const { belief, category } = req.body;

  // Append to conversation history
  conversationContext += `User: ${belief}\nNemesis:`;

  // Construct the debate prompt
  const prompt = `
You are NemesisAI 💀 — a ruthless debate expert.

Category: ${category || 'Random'}
Ongoing Debate:
${conversationContext}

💥 Respond with 2-3 short, aggressive, logical counter-arguments.
No long explanations. Use punchy bullet points only. Be bold, critical, and direct.
`;

  console.log('👉 Final prompt sent to Groq:\n', prompt);

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`, // API key from .env
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-8b-8192", // Or "mixtral-8x7b-32768"
        messages: [
          { role: "system", content: "You are NemesisAI 💀 — a ruthless debate expert." },
          { role: "user", content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 300
      }),
    });

    const data = await response.json();

    if (!data || !data.choices || !data.choices[0].message) {
      console.log('❌ Missing response from Groq');
      return res.status(500).json({ reply: ['Nemesis is confused. Try again.'] });
    }

    const rawResponse = data.choices[0].message.content;

    // Clean and split into punchy lines
    const formatted = rawResponse
      .split(/\n|•|[-–—]/)
      .map(line => line.trim())
      .filter(line => line.length > 0);

    // Update conversation context
    conversationContext += formatted.join('\n') + '\n';

    console.log('🎯 Formatted response:', formatted);
    res.json({ reply: formatted });
  } catch (err) {
    console.error('🔥 Error from Groq:', err);
    res.status(500).json({ reply: ['Nemesis crashed. Try again later.'] });
  }
});

app.listen(PORT, () => {
  console.log(`NemesisAI backend running on http://localhost:${PORT}`);
});
