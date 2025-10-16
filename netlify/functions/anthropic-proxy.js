export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  const { ANTHROPIC_API_KEY, ANTHROPIC_VERSION = '2023-06-01' } = process.env;
  if (!ANTHROPIC_API_KEY) return { statusCode: 500, body: 'Missing ANTHROPIC_API_KEY' };
  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': ANTHROPIC_VERSION
      },
      body: event.body,
    });
    const text = await upstream.text();
    return { statusCode: upstream.status, headers: { 'content-type': 'application/json' }, body: text };
  } catch {
    return { statusCode: 502, body: JSON.stringify({ error: 'Upstream error' }) };
  }
};
