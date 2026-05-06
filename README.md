# NovaBite

Standalone fine dining website with its own frontend, backend API, member portal, tasting builder, and booking flow.

## Public links

- Code repo: https://github.com/cosmicbubblegumgirl/Nova-bite
- Live static demo: https://cosmicbubblegumgirl.github.io/Nova-bite/
- Render backend setup: https://dashboard.render.com/
- Railway backend setup: https://railway.com/new

The static public demo runs without a backend by using browser demo storage. The full Node backend in `backend/server.js` is ready for Render or Railway, and the frontend can point to that deployed API by setting `window.NOVABITE_API_URL` in `public/config.js`.

## Run

```powershell
npm.cmd run dev
```

Open http://localhost:4201

Visual assets live in `public/assets`.

## API

- GET /api/health
- GET /api/site
- POST /api/register
- POST /api/login
- POST /api/custom-menus
- POST /api/bookings
