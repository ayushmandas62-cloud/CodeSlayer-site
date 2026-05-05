export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;

    // NVIDIA NIMs use the OpenAI-compatible chat completions format
    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'nvidia/autogen-72b', // Updated to the Autogen-72 model identifier
        messages: [
          { 
            role: 'system', 
            content: 'You are SLASH - CodeSlayer AI consultant. Be casual, warm, human. Short replies 2-3 sentences max. No emojis, no markdown, plain text only.' 
          },
          ...messages
        ],
        temperature: 0.6, // Slightly lower for more consistent professional responses
        max_tokens: 1024,
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error('NVIDIA API Error:', data.error);
      return res.status(500).json({ error: data.error.message });
    }

    // Extract the message content from the NVIDIA/OpenAI response structure
    const reply = data.choices[0].message.content;
    
    // We wrap this in an array to match the frontend expectation: { content: [{ text: '...' }] }
    return res.status(200).json({ content: [{ text: reply }] });

  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}