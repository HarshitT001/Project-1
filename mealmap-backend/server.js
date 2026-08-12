require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

app.use(express.json());
app.use(cookieParser());

// CLIENT_URL can be one origin or a comma-separated list (e.g. your Vercel
// preview URL + your custom domain). credentials:true is required for the
// httpOnly login cookie to be sent/received cross-origin — without it the
// browser silently drops the cookie and every "protected" request looks
// logged-out, which is why login appeared broken.
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// These three lines were missing before — that's why every /api/auth,
// /api/plans and /api/progress request was 404ing (only /api/health existed).
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/plans', require('./routes/planRoutes'));
app.use('/api/progress', require('./routes/progressRoutes'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`MealMap API running on port ${PORT}`));

app.use(
  cors({
    origin: [
      process.env.CLIENT_URL,
      'https://splendid-youtiao-104ba1.netlify.app'
    ],
    credentials: true,
  })
);