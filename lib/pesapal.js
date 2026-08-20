const API_BASE = process.env.PESAPAL_ENV === 'live'
  ? 'https://pay.pesapal.com/v3'
  : 'https://cybqa.pesapal.com/pesapalv3';

async function pesapalRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.error) {
    const message = data?.error?.message || data?.message || `Pesapal request failed (${response.status})`;
    throw new Error(message);
  }
  return data;
}

async function getPesapalToken() {
  if (!process.env.PESAPAL_CONSUMER_KEY || !process.env.PESAPAL_CONSUMER_SECRET) {
    throw new Error('Pesapal credentials are not configured.');
  }
  const data = await pesapalRequest('/api/Auth/RequestToken', {
    method: 'POST',
    body: JSON.stringify({
      consumer_key: process.env.PESAPAL_CONSUMER_KEY,
      consumer_secret: process.env.PESAPAL_CONSUMER_SECRET
    })
  });
  if (!data.token) throw new Error(data.message || 'Pesapal did not return an access token.');
  return data.token;
}

async function authenticatedRequest(path, token, options = {}) {
  return pesapalRequest(path, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, ...(options.headers || {}) }
  });
}

module.exports = { authenticatedRequest, getPesapalToken, pesapalRequest };
