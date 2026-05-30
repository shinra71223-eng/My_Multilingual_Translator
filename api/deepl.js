export default async function handler(req, res) {
  // Set CORS headers in case the user runs it locally from another port
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(400).json({ error: 'Missing Authorization header' });
  }

  // Extract DeepL API key
  const apiKey = authHeader.replace('DeepL-Auth-Key ', '').trim();
  const isFreeKey = apiKey.endsWith(':fx');
  const host = isFreeKey ? 'api-free.deepl.com' : 'api.deepl.com';

  try {
    if (req.method === 'GET') {
      // Usage check (test connection)
      const targetUrl = `https://${host}/v2/usage`;
      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'Authorization': `DeepL-Auth-Key ${apiKey}`
        }
      });
      const data = await response.json();
      return res.status(response.status).json(data);
    } else if (req.method === 'POST') {
      // Translation request
      const targetUrl = `https://${host}/v2/translate`;
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Authorization': `DeepL-Auth-Key ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(req.body)
      });
      const data = await response.json();
      return res.status(response.status).json(data);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('DeepL proxy error:', error);
    return res.status(500).json({ error: error.message });
  }
}
