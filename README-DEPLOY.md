# Deploy Backend to Render — Step-by-Step Guide

This guide walks you through deploying the **backend** (Node + Express + Socket.IO)
to [Render](https://render.com) so it works with your already-deployed frontend:

- **Frontend (Vercel):** `https://chat-verse-gules.vercel.app`
- **Backend (Render):** `https://chatverse-backend.onrender.com` (after deploy)

---

## 1. Prerequisites

- A GitHub account with this repository pushed
- A Render account (free tier is fine)
- **MongoDB Atlas** cluster + connection string (optional)
- **Cloudinary** account + credentials (needed for media uploads)

---

## 2. Pre-deploy config (already done in this repo)

| Change | File | Why |
| --- | --- | --- |
| `start` → `node dist/server.js` | `backend/package.json` | Render runs `npm start`; TypeScript compiles to `dist/` via `npm run build` |
| `engines.node >= 18` | `backend/package.json` | Render picks a compatible Node version |
| `render.yaml` blueprint | repo root | One-click service definition for Render |
| `frontend/.env` → `https://chatverse-backend.onrender.com` | `frontend/.env` | REST + Socket.IO point at the new backend |

> ⚠️ If Render assigns a **different URL** (e.g. `chatverse-backend-xxxx.onrender.com`),
> update `frontend/.env` and **redeploy the Vercel frontend**.

---

## 3. Deploy via Render Dashboard (recommended)

1. Go to [dashboard.render.com](https://dashboard.render.com) → **New** → **Blueprint**.
2. Connect your GitHub repo.
3. Render reads `render.yaml` and offers a service named `chatverse-backend`.
4. In the service settings, add these **environment variables** (Render will prompt
   for the ones marked `sync: false`):

```env
NODE_ENV=production
CLIENT_URL=https://chat-verse-gules.vercel.app
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
JWT_ACCESS_SECRET=<long random string>
JWT_REFRESH_SECRET=<long random string>
CLOUD_NAME=<your-cloudinary-cloud>
API_KEY=<your-cloudinary-api-key>
API_SECRET=<your-cloudinary-api-secret>
```

5. Click **Apply** → **Deploy**.
6. Render runs: `npm install && npm run build` then `npm start`
   (which runs `node dist/server.js`).

---

## 4. Verify the backend

After the deploy finishes, open:

```
https://chatverse-backend.onrender.com/health
```

You should see:

```json
{ "success": true, "message": "ChatVerse Backend Running" }
```

### Quick checks

| Test | How |
| --- | --- |
| Health | `GET https://chatverse-backend.onrender.com/health` |
| REST API | `POST https://chatverse-backend.onrender.com/api/auth/login` |
| Socket.IO | Open frontend at `chat-verse-gules.vercel.app`, log in, send a chat |
| CORS | Login from the Vercel URL — should succeed (CLIENT_URL allows it) |

---

## 5. Important notes for Render (free tier)

- **Ephemeral filesystem** — files uploaded via multer land in `backend/uploads/`
  and are **wiped on every redeploy/restart**. Configure **Cloudinary** so uploads
  persist (the backend already falls back to local `/uploads`, but those won't last).
- **Free tier spins down** after 15 min of inactivity — the first request after
  idle may take ~30–60s to wake up.
- **WebSockets are supported**, but the client must use `wss://` (it does —
  `https://chatverse-backend.onrender.com` handles the upgrade automatically).
- The backend sets `app.set("trust proxy", 1)` already, so the rate limiter works
  correctly behind Render's proxy.

---

## 6. When your backend URL changes

If your Render service ends up at a different URL than `chatverse-backend.onrender.com`:

1. Edit `frontend/.env`:
   ```env
   VITE_API_URL=https://<your-render-url>.onrender.com/api
   VITE_SOCKET_URL=https://<your-render-url>.onrender.com
   ```
2. Commit + push → Vercel auto-redeploys.
3. Update `CLIENT_URL` in the Render dashboard to `https://chat-verse-gules.vercel.app`
   (if it isn't already).

---

## 7. Troubleshooting

| Symptom | Fix |
| --- | --- |
| Deploy fails at build | Run `cd backend && npm run build` locally; fix any TS errors |
| Server exits instantly | Check `MONGODB_URI` is set & Atlas whitelists Render's egress IPs (or use `0.0.0.0/0`) |
| CORS errors in browser | Confirm `CLIENT_URL` on Render = `https://chat-verse-gules.vercel.app` |
| Login works but chat doesn't | Check `VITE_SOCKET_URL` = Render origin (no `/api`, no trailing slash) |
| Can't upload images | Cloudinary env vars (`CLOUD_NAME`, `API_KEY`, `API_SECRET`) missing or wrong |

