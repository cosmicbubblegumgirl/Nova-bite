# NovaBite deployment

NovaBite is ready for a full-stack deployment pattern:

```text
Frontend: GitHub Pages, Vercel, or Netlify static project from public/
Backend: Render, Railway, Fly, or VPS Node service using npm start
Database: private Postgres or MongoDB connection via DATABASE_URL
Domain: clientdomain.com -> frontend, api.clientdomain.com -> backend
```

Use `.env.example` as the production variable checklist. Do not commit `.env`.

Current data is stored in memory for demo use. Before client launch, connect `backend/server.js` to the hosted database using `process.env.DATABASE_URL`.

## Public URLs

```text
GitHub repo: https://github.com/cosmicbubblegumgirl/Nova-bite
Live static frontend: https://cosmicbubblegumgirl.github.io/Nova-bite/
Render create link: https://dashboard.render.com/
Railway create link: https://railway.com/new
```

The GitHub Pages frontend uses browser demo storage until a backend URL is added in `public/config.js`:

```js
window.NOVABITE_API_URL = 'https://your-novabite-api.onrender.com';
```

## Backend host

```text
Root directory: repository root
Build command: npm install
Start command: npm start
Health check: /api/health
```

For Render, create a new Web Service, connect `cosmicbubblegumgirl/Nova-bite`, use the commands above, then copy the generated public API URL into `public/config.js`.

For Railway, create a new project, deploy from the GitHub repo, generate a public domain for the service, then copy that URL into `public/config.js`.

## Frontend host

Use `public/` as the frontend output folder if deploying separately. Point frontend API calls to:

```text
https://api.clientdomain.com
```
