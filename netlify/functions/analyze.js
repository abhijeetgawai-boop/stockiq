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

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const finnhubKey = process.env.FINNHUB_API_KEY;

  if (body.ping) {
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  }

  if (body.action === 'price') {
    if (!finnhubKey) return { statusCode: 500, headers, body: JSON.stringify({ error: 'Finnhub key missing' }) };
    const { ticker } = body;
    try {
      const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${finnhubKey}`);
      const data = await res.json();
      return { statusCode: 200, headers, body: JSON.stringify({
        price: data.c,
        change: data.d,
        changePct: data.dp,
        high: data.h,
        low: data.l,
        prevClose: data.pc
      })};
    } catch(e) {
      return { statusCode: 502, headers, body: JSON.stringify({ error: 'Price fetch failed' }) };
    }
  }

  if (body.action === 'recommendations') {
    if (!finnhubKey) return { statusCode: 500, headers, body: JSON.stringify({ error: 'Finnhub key missing' }) };
    const { ticker } = body;
    try {
      const res = await fetch(`https://finnhub.io/api/v1/stock/recommendation?symbol=${ticker}&token=${finnhubKey}`);
      const data = await res.json();
      const latest = data[0] || {};
      return { statusCode: 200, headers, body: JSON.stringify({
        strongBuy: latest.strongBuy || 0,
        buy: latest.buy || 0,
        hold: latest.hold || 0,
        sell: latest.sell || 0,
        strongSell: latest.strongSell || 0,
        period: latest.period || ''
      })};
    } catch(e) {
      return { statusCode: 502, headers, body: JSON.stringify({ error: 'Recommendations fetch failed' }) };
    }
  }

  if (body.action === 'news') {
    if (!finnhubKey) return { statusCode: 500, headers, body: JSON.stringify({ error: 'Finnhub key missing' }) };
    const { ticker } = body;
    const today = new Date().toISOString().split('T')[0];
    const week = new Date(Date.now() - 7*24*60*60*1000).toISOString().split('T')[0];
    try {
      const res = await fetch(`https://finnhub.io/api/v1/company-news?symbol=${ticker}&from=${week}&to=${today}&token=${finnhubKey}`);
      const data = await res.json();
      const headlines = (data || []).slice(0, 3).map(n => ({ headline: n.headline, url: n.url, source: n.source }));
      return { statusCode: 200, headers, body: JSON.stringify({ headlines }) };
    } catch(e) {
      return { statusCode: 502, headers, body: JSON.stringify({ error: 'News fetch failed' }) };
    }
  }

  if (!anthropicKey) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Anthropic key not configured' }) };
  }

  const { ticker, name, price, catalysts, risk, target, capital, strongBuy, buy, hold, sell } = body;
  if (!ticker) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing ticker' }) };
  }

  const analystSummary = (strongBuy || buy)
    ? `Current analyst votes: ${strongBuy} strong buy, ${buy} buy, ${hold} hold, ${sell} sell.`
    : '';

  const prompt = `You are a senior equity analyst writing for a beginner investor who has $${capital || 585} to invest. Analyze ${ticker} (${name}) in 5-6 sentences. Cover: (1) why this stock is worth considering right now, (2) the main growth catalyst (${catalysts}), (3) the key risk (${risk}), (4) the analyst price target (${target}), ${analystSummary} and (5) a specific practical tip for someone with limited capital buying this stock. Be honest, direct, and concrete. Current price: $${price}. Write in flowing prose, no bullet points or headers.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      return { statusCode: 502, headers, body: JSON.stringify({ error: 'AI service error. Please try again.' }) };
    }

    const data = await response.json();
    const analysis = data.content?.map(c => c.text || '').join('') || 'Analysis unavailable.';
    return { statusCode: 200, headers, body: JSON.stringify({ analysis }) };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal error. Please try again.' }) };
  }
};
