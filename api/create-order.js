const { authenticatedRequest, getPesapalToken } = require('../lib/pesapal');

const PLANS = {
  starter: { name: 'Starter package deposit', amount: 100, description: '50% deposit for the Starter website package' },
  business: { name: 'Business package deposit', amount: 200, description: '50% deposit for the Business website package' }
};

function sendJson(res, status, body) {
  res.status(status).setHeader('Cache-Control', 'no-store').json(body);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed.' });

  try {
    const { plan, firstName, lastName, email, phone } = req.body || {};
    const selectedPlan = PLANS[plan];
    if (!selectedPlan) return sendJson(res, 400, { error: 'Choose a valid package.' });
    if (!firstName || !lastName || !email || !phone) {
      return sendJson(res, 400, { error: 'First name, last name, email and phone are required.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return sendJson(res, 400, { error: 'Enter a valid email address.' });
    }
    if (!process.env.PESAPAL_IPN_ID) {
      return sendJson(res, 500, { error: 'Pesapal IPN is not configured yet.' });
    }

    const siteUrl = (process.env.PUBLIC_SITE_URL || 'https://elijah-mugo.vercel.app').replace(/\/$/, '');
    const token = await getPesapalToken();
    const merchantReference = `EM-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const data = await authenticatedRequest('/api/Transactions/SubmitOrderRequest', token, {
      method: 'POST',
      body: JSON.stringify({
        id: merchantReference,
        currency: 'USD',
        amount: selectedPlan.amount,
        description: selectedPlan.description,
        callback_url: `${siteUrl}/?payment=returned`,
        notification_id: process.env.PESAPAL_IPN_ID,
        billing_address: {
          email_address: email,
          phone_number: phone,
          country_code: 'KE',
          first_name: firstName,
          last_name: lastName
        }
      })
    });

    if (!data.redirect_url || !data.order_tracking_id) {
      throw new Error(data.message || 'Pesapal did not return a checkout URL.');
    }
    return sendJson(res, 200, { redirectUrl: data.redirect_url, orderTrackingId: data.order_tracking_id });
  } catch (error) {
    console.error('Pesapal order error:', error.message);
    return sendJson(res, 502, { error: 'We could not start the payment. Please try again or use WhatsApp.' });
  }
};
