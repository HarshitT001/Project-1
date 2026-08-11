# MealMap Backend

Node.js + Express + MongoDB API for MealMap. Handles signup/login and stores
each logged-in user's diet plans and progress logs against their own account.

## Folder structure

```
mealmap-backend/
├── server.js               entry point — wires everything together
├── config/
│   └── db.js                MongoDB connection
├── models/                  Mongoose schemas
│   ├── User.js               name, email, hashed password, saved profile
│   ├── DietPlan.js           one saved generated plan, linked to a user
│   └── ProgressLog.js        one weight/calorie log entry, linked to a user
├── controllers/             route logic
│   ├── authController.js     register / login / logout / me / update profile
│   ├── planController.js     create / list / get / delete plans
│   └── progressController.js add / list progress logs
├── routes/                  Express routers (map URLs -> controllers)
│   ├── authRoutes.js
│   ├── planRoutes.js
│   └── progressRoutes.js
├── middleware/
│   ├── authMiddleware.js     verifies the login cookie, attaches req.user
│   └── errorMiddleware.js    404 + centralized error responses
├── utils/
│   └── generateToken.js      signs a JWT and sets it as an httpOnly cookie
├── .env.example
└── package.json
```

**Why this layout:** routes only map a URL to a function, controllers only
hold business logic, models only define data shape, middleware only guards
requests. Each user's data (plans, progress) is always queried and written
with `user: req.user._id` — so one user can never read or delete another
user's rows, even if they guess an ID.

## How login works

1. `POST /api/auth/register` or `/login` checks the password (hashed with
   bcrypt, never stored in plain text) and, on success, signs a JWT and sets
   it as an **httpOnly cookie** — not returned in the JSON body.
2. Every protected route (`/api/plans/*`, `/api/progress/*`, `/api/auth/me`)
   runs `authMiddleware.protect`, which reads that cookie, verifies the JWT,
   and loads the matching user onto `req.user`.
3. Because the cookie is httpOnly, frontend JavaScript can't read or leak
   the token (safer than storing it in `localStorage`). The browser just
   sends it automatically on every request to your API domain.

## Setup

1. Install dependencies:
   ```
   cd mealmap-backend
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in real values:
   ```
   cp .env.example .env
   ```
   - `MONGO_URI` — a local MongoDB (`mongodb://127.0.0.1:27017/mealmap`) or a
     free MongoDB Atlas cluster connection string.
   - `JWT_SECRET` — any long random string.
   - `CLIENT_URL` — the exact origin your `mealmap.html` is served from
     (e.g. `http://localhost:5500` if you open it with VS Code's Live
     Server, or your deployed frontend URL). This must match exactly or the
     login cookie will be blocked by the browser's CORS rules.
3. Start MongoDB locally (`mongod`) if you're not using Atlas.
4. Run the API:
   ```
   npm run dev
   ```
   You should see `MealMap API running on port 5000`.
5. Open `mealmap.html` in a real browser (not inside Claude's artifact
   preview — see note below) and it will call this API.

## Endpoints

| Method | Route                | Auth | Purpose                          |
|--------|-----------------------|------|-----------------------------------|
| POST   | /api/auth/register     | No   | Create account, logs in           |
| POST   | /api/auth/login        | No   | Log in                            |
| POST   | /api/auth/logout       | Yes  | Clear the session cookie          |
| GET    | /api/auth/me           | Yes  | Current logged-in user            |
| PUT    | /api/auth/profile      | Yes  | Save age/weight/goal/diet, etc.   |
| POST   | /api/plans             | Yes  | Save a generated plan             |
| GET    | /api/plans             | Yes  | List this user's saved plans      |
| GET    | /api/plans/:id         | Yes  | Get one saved plan                |
| DELETE | /api/plans/:id         | Yes  | Delete a saved plan               |
| POST   | /api/progress          | Yes  | Log today's weight/calories       |
| GET    | /api/progress          | Yes  | This user's progress history      |

## Important note about the Claude artifact preview

Claude's in-chat HTML preview runs in a sandboxed browser tab and cannot
reach a server on your own `localhost` — that's a browser/network
limitation of the preview, not of this code. To actually test login and
saved plans:

1. Download `mealmap.html` from the chat.
2. Run this backend locally (steps above).
3. Open `mealmap.html` directly in Chrome/Edge/Firefox (or serve it with
   Live Server) — from there it can reach `http://localhost:5000` normally.

When you deploy for real, host the backend (Render, Railway, an EC2 box,
etc.), set `CLIENT_URL` to your live frontend's URL, and update `API_BASE`
at the top of the `<script>` in `mealmap.html` to your backend's live URL.
