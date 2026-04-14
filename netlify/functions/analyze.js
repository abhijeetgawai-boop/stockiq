exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  // Health check ping
  if (body.ping) {
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'API key not configured. Add ANTHROPIC_API_KEY to Netlify environment variables.' })
    };
  }

  const { ticker, name, price, catalysts, risk, target, capital } = body;
  if (!ticker) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing ticker' }) };
  }

  const prompt = `You are a senior equity analyst writing for a beginner investor who has $${capital || 585} to invest. Analyze ${ticker} (${name}) in 5–6 sentences. Cover: (1) why this stock is worth considering right now, (2) the main growth catalyst (${catalysts}), (3) the key risk (${risk}), (4) the analyst price target (${target}), and (5) a specific practical tip for someone with limited capital buying this stock. Be honest, direct, and concrete. Current price: $${price}. Write in flowing prose — no bullet points or headers.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic API error:', response.status, errText);
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ error: 'AI service error. Please try again.' })
      };
    }

    const data = await response.json();
    const analysis = data.content?.map(c => c.text || '').join('') || 'Analysis unavailable.';
    return { statusCode: 200, headers, body: JSON.stringify({ analysis }) };

  } catch (err) {
    console.error('Function error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal error. Please try again.' })
    };
  }
};
