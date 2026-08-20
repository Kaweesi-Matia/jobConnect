import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './config/db.js';
import auth from './routes/auth.js';
import jobs from './routes/jobs.js';
import applications from './routes/applications.js';

const app = express();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
  })
);

app.use(express.json({ limit: '1mb' }));

app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'))
);

app.get('/api/health', async (req, res) => {
  try {
    await connectDB();

    res.json({
      ok: true,
      service: 'JobConnect API',
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
});

app.use('/api/auth', auth);
app.use('/api/jobs', jobs);
app.use('/api/applications', applications);

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    message: err.message || 'Server error',
  });
});

export default app;
