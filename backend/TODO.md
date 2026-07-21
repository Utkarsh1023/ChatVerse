# Backend Auth (Node/Express/Mongo/Mongoose) - Implementation Checklist

## Plan
- Audit current repo state (JS vs TS, wiring, env loading).
- Implement required TypeScript files in the specified clean folder structure.
- Ensure ESM + TypeScript works with current tooling.
- Wire routes into app.ts.
- Centralize error handling.
- Implement JWT auth via httpOnly cookies + cookie-parser.
- Ensure input validation + proper status codes.
- Ensure password hashing with bcryptjs.
- Update package scripts if needed.

## Steps
- [ ] Step 1: Fix TS/ESM compatibility (update tsconfig.json) so `npm run dev` can run TS ESM.
- [ ] Step 2: Implement `backend/src/config/database.js` (or TS equivalent) and `src/config/database` usage.
- [ ] Step 3: Create/overwrite TypeScript model `src/models/User.ts`.
- [ ] Step 4: Create/overwrite TypeScript utils `src/utils/generateToken.ts`.
- [ ] Step 5: Create/overwrite TypeScript middleware `src/middleware/error.middleware.ts` and `src/middleware/auth.middleware.ts`.
- [ ] Step 6: Create/overwrite TypeScript controller `src/controllers/auth.controller.ts`.
- [ ] Step 7: Create/overwrite TypeScript routes `src/routes/auth.routes.ts`.
- [ ] Step 8: Create/overwrite `src/app.ts` to mount auth routes and register middlewares.
- [ ] Step 9: Create/overwrite `src/server.ts` to start HTTP server + connect DB.
- [ ] Step 10: Update any entrypoints (if required) to ensure `/api/auth/*` works.
- [ ] Step 11: Add/verify `.env` and CORS settings for Vite (http://localhost:5173).
- [ ] Step 12: Quick local test with curl for register/login/me/logout.

