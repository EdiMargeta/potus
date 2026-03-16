import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import eventsRouter from './routes/events.js';
import promisesRouter from './routes/promises.js';
import commentsRouter from './routes/comments.js';
import reactionsRouter from './routes/reactions.js';
import adminRouter from './routes/admin.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// FIX: Support multiple origins (local dev + production)
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:4173',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, Railway healthcheck)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-admin-password'],
  credentials: true,
}));

app.use(express.json({ limit: '50kb' })); // Prevent oversized payloads

app.use('/api/events', eventsRouter);
app.use('/api/promises', promisesRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/reactions', reactionsRouter);
app.use('/api/admin', adminRouter);

app.get('/api/health', (req, res) => res.json({ status: 'ok', app: 'POTUS PARADOX' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => console.log(`POTUS PARADOX server running on port ${PORT}`));
