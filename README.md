# Funded — Demo Trading Terminal

A browser-based educational market simulator with virtual balance only. This is not a broker and does not support deposits, withdrawals, or real-money trading.

## MVP features
- Responsive terminal interface and six illustrative assets
- Randomly simulated prices (not live market quotes)
- $10,000 virtual starting balance
- UP/DOWN practice positions with 1/2/5 minute expiry
- Local settlement and trade history
- No account registration or personal financial data

## Run locally
`npm install` then `npm run dev`.

## Render
Node web service. Build: `npm install && npm run build`. Start: `npm start`.

## Limitations
This milestone uses client-side simulated prices and browser state. It has no production backend, persistent database, authenticated users, or live market data. It is an educational simulator only; never connect real-money payments or withdrawals.