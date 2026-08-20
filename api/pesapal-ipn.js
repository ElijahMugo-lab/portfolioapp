const { authenticatedRequest, getPesapalToken } = require('../lib/pesapal');

module.exports = async function handler(req, res) {
  const { OrderTrackingId: trackingId, OrderMerchantReference: merchantReference } = req.query || {};
  console.info('Pesapal IPN received:', { trackingId, merchantReference });

  if (trackingId) {
    try {
      const token = await getPesapalToken();
      const status = await authenticatedRequest(`/api/Transactions/GetTransactionStatus?orderTrackingId=${encodeURIComponent(trackingId)}`, token);
      console.info('Pesapal transaction status:', status);
    } catch (error) {
      console.error('Pesapal IPN status error:', error.message);
    }
  }

  res.status(200).send('OK');
};
