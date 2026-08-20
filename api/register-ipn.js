const { authenticatedRequest, getPesapalToken } = require('../lib/pesapal');

function sendJson(res, status, body) {
  res.status(status).setHeader('Cache-Control', 'no-store').json(body);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed.' });
  if (!process.env.PESAPAL_SETUP_TOKEN || req.headers['x-setup-token'] !== process.env.PESAPAL_SETUP_TOKEN) {
    return sendJson(res, 401, { error: 'Unauthorized.' });
  }
  try {
    const siteUrl = (process.env.PUBLIC_SITE_URL || 'https://elijah-mugo.vercel.app').replace(/\/$/, '');
    const token = await getPesapalToken();
    const data = await authenticatedRequest('/api/URLSetup/RegisterIPN', token, {
      method: 'POST',
      body: JSON.stringify({ url: `${siteUrl}/api/pesapal-ipn`, ipn_notification_type: 'GET' })
    });
    return sendJson(res, 200, data);
  } catch (error) {
    console.error('Pesapal IPN registration error:', error.message);
    return sendJson(res, 502, { error: 'Could not register the Pesapal IPN URL.' });
  }
};
