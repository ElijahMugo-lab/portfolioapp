const { authenticatedRequest, getPesapalToken } = require('../lib/pesapal');

function sendJson(res, status, body) {
  res.status(status).setHeader('Cache-Control', 'no-store').json(body);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed.' });
  const trackingId = req.query?.orderTrackingId;
  if (!trackingId) return sendJson(res, 400, { error: 'A transaction ID is required.' });

  try {
    const token = await getPesapalToken();
    const status = await authenticatedRequest(`/api/Transactions/GetTransactionStatus?orderTrackingId=${encodeURIComponent(trackingId)}`, token);
    return sendJson(res, 200, {
      status: status.payment_status_description || status.payment_status_code || status.status,
      confirmed: ['COMPLETED', 'PAID'].includes(String(status.payment_status_description || '').toUpperCase()),
      transaction: status
    });
  } catch (error) {
    console.error('Pesapal status error:', error.message);
    return sendJson(res, 502, { error: 'We could not verify this payment yet.' });
  }
};
