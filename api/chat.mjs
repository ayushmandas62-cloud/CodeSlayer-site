export default async function handler(req, res) {
  // 1. Only allow POST requests to prevent random browser access
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;

    // 2. Call NVIDIA NIM API
    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'nvidia/autogen-72b', 
        messages: [
          { 
            role: 'system', 
            content: 'You are SLASH - CodeSlayer AI consultant. Be casual, warm, human. Short replies 2-3 sentences max. No emojis, no markdown, plain text only.' 
          },
          ...messages
        ],
        temperature: 0.6,
        max_tokens: 1024,
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    // 3. Extract response and format it for the frontend
    const reply = data.choices[0].message.content;
    return res.status(200).json({ content: [{ text: reply }] });

  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
