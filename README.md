# Kodbank

Full-stack banking web application with Node.js (Express), MySQL, JWT auth, and React (Vite) frontend.

## Stack

- **Backend:** Node.js, Express.js, MySQL (mysql2 pool), JWT, cookies (httpOnly), bcrypt
- **Frontend:** React (Vite), Axios, React Router, canvas-confetti

## Project structure

```
kodbank/
├── backend/
│   ├── server.js
│   ├── db.js
│   ├── .env.example
│   ├── routes/
│   ├── controllers/
│   └── middleware/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── api/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── vite.config.js
└── README.md
```

## Setup

### 1. Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` and set:

- `DB_HOST` – Aiven MySQL host
- `DB_PORT` – usually `3306`
- `DB_USER` – database user
- `DB_PASSWORD` – database password
- `DB_NAME` – database name
- `JWT_SECRET` – strong secret for JWT signing

Then:

```bash
npm install
npm start
```

The server will:

- Connect to MySQL and log success
- Create `KodUser` and `UserToken` tables if they don’t exist
- Listen on `PORT` (default `5000`)

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173` and proxies `/api` to the backend (see `vite.config.js`).

## API

| Method | Endpoint           | Auth | Description                    |
|--------|--------------------|------|--------------------------------|
| POST   | `/api/register`    | No   | Register (username, email, password, phone) |
| POST   | `/api/login`       | No   | Login; sets httpOnly cookie    |
| POST   | `/api/logout`      | No   | Clears auth cookie             |
| GET    | `/api/balance`    | Yes  | Returns balance (cookie auth)  |

## Deployment

### Render

**Backend (Web Service)**

1. New → Web Service; connect repo; root directory: `backend`.
2. Build: `npm install`
3. Start: `npm start`
4. Add environment variables: `DB_*`, `JWT_SECRET`, `NODE_ENV=production`, `FRONTEND_URL=https://your-frontend.onrender.com`
5. For MySQL (e.g. Aiven), use the provided host, port, user, password, and database in `DB_*`.

**Frontend (Static Site)**

1. New → Static Site; root: `frontend`.
2. Build: `npm install && npm run build`
3. Publish directory: `dist`
4. Add env: `VITE_API_URL=https://your-backend.onrender.com` (so API calls go to your backend).

**CORS:** Backend already uses `cors({ origin: process.env.FRONTEND_URL, credentials: true })` when `NODE_ENV=production`. Set `FRONTEND_URL` to the deployed frontend URL.

---

### Railway

**Backend**

1. New Project → Deploy from GitHub; select repo; set root to `backend`.
2. Add MySQL (or attach Aiven/external DB). Set `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `NODE_ENV=production`, `FRONTEND_URL=<frontend URL>`.
3. Build: `npm install`; Start: `npm start`.
4. Use the generated backend URL (e.g. `https://your-app.railway.app`) for `FRONTEND_URL` and for frontend `VITE_API_URL`.

**Frontend**

1. New Service → same repo; root: `frontend`.
2. Build: `npm install && npm run build`.
3. Start: `npx serve -s dist` (or use Railway’s static site preset if available).
4. Set `VITE_API_URL` to your Railway backend URL and redeploy so the build picks it up.

---

**Cookie / CORS:** In production the backend uses `sameSite: 'none'` and `secure: true` for the auth cookie. Use HTTPS for both frontend and backend and set `FRONTEND_URL` and `VITE_API_URL` correctly so cookies and CORS work.

## Security

- Passwords hashed with bcrypt
- JWT secret from env; token in httpOnly cookie
- Cookies: `httpOnly`, `secure` in production, `sameSite: 'strict'` (dev) / `'none'` (production)
- CORS with credentials for frontend domain

## Run summary

| App      | Command           |
|----------|-------------------|
| Backend  | `cd backend && npm install && npm start` |
| Frontend | `cd frontend && npm install && npm run dev` |

After both are running: register at `/register`, login at `/login`, then open Dashboard and use “Check Balance” to see balance with confetti.
