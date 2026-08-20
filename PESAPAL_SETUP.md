# Pesapal setup

The site uses Pesapal API 3.0 through Vercel serverless functions. Live credentials must be added in Vercel, not committed to the repository.

## Vercel environment variables

Add these variables for the Production environment:

- `PESAPAL_ENV=live`
- `PESAPAL_CONSUMER_KEY`
- `PESAPAL_CONSUMER_SECRET`
- `PESAPAL_SETUP_TOKEN` with a long private random value
- `PUBLIC_SITE_URL=https://elijah-mugo.vercel.app`

## Register the IPN URL

1. Deploy once with the variables above.
2. Send a POST request to `/api/register-ipn` with the `x-setup-token` header set to the value of `PESAPAL_SETUP_TOKEN`.
3. Copy the returned `ipn_id` into the Vercel variable `PESAPAL_IPN_ID`.
4. Redeploy.

PowerShell example:

```powershell
Invoke-RestMethod -Method Post -Uri "https://elijah-mugo.vercel.app/api/register-ipn" -Headers @{ "x-setup-token" = "YOUR_SETUP_TOKEN" }
```

The pricing page currently accepts 50% deposits for Starter (`$100`) and Business (`$200`). Premium remains quote-based because its displayed price starts at `$800`.
