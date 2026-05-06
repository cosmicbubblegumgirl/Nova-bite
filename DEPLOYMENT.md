# NovaBite deployment

NovaBite is ready for a full-stack deployment pattern:

```text
Frontend: Vercel/Netlify static project from public/
Backend: Render/Railway/Fly/VPS Node service using npm start
Database: private Postgres or MongoDB connection via DATABASE_URL
Domain: clientdomain.com -> frontend, api.clientdomain.com -> backend
```

Use `.env.example` as the production variable checklist. Do not commit `.env`.

Current data is stored in memory for demo use. Before client launch, connect `backend/server.js` to the hosted database using `process.env.DATABASE_URL`.

## Backend host

```text
Root directory: novabite
Build command: npm install
Start command: npm start
Health check: /api/health
```

## Frontend host

Use `public/` as the frontend output folder if deploying separately. Point frontend API calls to:

```text
https://api.clientdomain.com
```
