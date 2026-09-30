
# Freelance Lead Management CRM

Production-oriented MERN stack CRM for freelance leads: JWT auth, admin/member roles, lead pipeline, team management, and a HubSpot-style dashboard UI with light/dark mode.

## Stack

- **Frontend:** React 19 (Vite), Tailwind CSS v4, React Router, Axios, Zustand
- **Backend:** Node.js, Express.js, MongoDB (Mongoose), JWT, bcrypt

## Which folders to use (CRM)

For **Freelance Lead CRM** you only work with these two:

| Folder | What it is |
|--------|------------|
| **`server/`** | CRM API (Node + Express + MongoDB). This is your **real backend** for the app. |
| **`frontend/`** | CRM web UI (React + Vite). This is your **only** CRM frontend. |

The **`backend/`** folder is a **separate, older project**: Python + FastAPI for CSV sales analytics. The CRM does **not** call it. You can ignore or delete `backend/` if you only care about the CRM.

Root **`npm run dev`** starts **`server`** + **`frontend`** only (see `package.json`).

## Prerequisites

- Node.js 18+
- MongoDB running locally or a connection string (MongoDB Atlas)

## Setup

### 1. MongoDB

Start local MongoDB, or create a cluster and copy the connection URI.

### 2. Backend

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:

- `MONGODB_URI` — your MongoDB connection string
- `JWT_SECRET` — long random string (required in production)
- `PORT` — default `5000`
- `CLIENT_ORIGIN` — default `http://localhost:3000`

Install and run:

```bash
npm install
npm run dev
```

API base: `http://localhost:5000/api`

### 3. Frontend

```bash
cd frontend
cp .env.example .env
```

Optional: set `VITE_API_URL` to a full API URL (e.g. production). In development, Vite proxies `/api` to the backend, so you can leave it unset.

```bash
npm install
npm run dev
```

App: `http://localhost:3000`

### 4. Run both (repo root)

```bash
npm install
npm run dev
```

## First user

The **first registered user** becomes **admin**. Later registrations are **members** unless you add admins from the Team screen.

## API overview

| Method | Path | Notes |
|--------|------|--------|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user (JWT) |
| GET | `/api/leads/dashboard` | Dashboard stats + recent activity |
| GET | `/api/leads` | List (query: `page`, `limit`, `search`, `status`, `assignedTo`) |
| GET | `/api/leads/:id` | Detail |
| POST | `/api/leads` | Create (**admin**) |
| PUT | `/api/leads/:id` | Update; members only for assigned leads |
| DELETE | `/api/leads/:id` | Delete (**admin**) |
| GET | `/api/users` | List users (**admin**) |
| POST | `/api/users` | Create user (**admin**) |
| DELETE | `/api/users/:id` | Remove user (**admin**) |

Send header: `Authorization: Bearer <token>`

## Legacy Python backend (`backend/`)

Optional FastAPI + pandas demo (upload CSV, charts). **Not connected** to the MERN CRM. To run it you would use Uvicorn and a different frontend; the CRM uses **`server/`** + **`frontend/`** only.

## Production notes

- Set strong `JWT_SECRET` and HTTPS in production.
- Build the frontend: `npm run build:frontend`, serve static files or deploy to a CDN.
- Point `CLIENT_ORIGIN` at your real frontend URL for CORS.
