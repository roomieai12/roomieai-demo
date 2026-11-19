# ROOMIE AI Demo

A demo of ROOMIE AI for Japanese property management companies. A renter chats with a bot to find an apartment and request a viewing, while the management company watches inquiries come in on a dashboard.

> **Demo only.** All properties and data are fictional samples. Nothing is sent to a server, and no real bookings or contracts are made. Viewings are always shown as 仮予約 (tentative).

## Features

- **Renter chat**: a phone-style chat that asks about budget, move-in timing and pets, suggests matching sample listings, and books a tentative viewing.
- **Consent screen**: the chat starts only after the renter agrees to how their data is used.
- **Management dashboard**: inquiry stats, tentative bookings, a queue of chats handed to staff, sample listings and an activity log.
- **Hand-off to staff**: questions about contracts, legal matters or tenant screening are passed to a human instead of being answered by the bot.
- **Demo controls**: switch scenarios, toggle business hours (open/closed), and reset.

## Tech stack

React 18, TypeScript, Vite, Tailwind CSS, Vitest

## Getting started

Requires **Node.js 20 or later**.

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

## Scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start the dev server |
| `npm test` | Run the tests |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Preview the production build |

## Deploy

Run `npm run build` and upload the `dist/` folder to any static host, such as Vercel, Netlify or GitHub Pages.

## Notes

- Business hours (weekdays 9:00–18:00) follow Japan time. If you demo outside those hours, switch to 「営業時間内」 in the header first.
- Chat data is saved only in your browser's localStorage. **Reset** clears it.
