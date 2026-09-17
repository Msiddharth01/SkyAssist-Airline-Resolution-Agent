require('dotenv').config();
const express = require('express');
const cors = require('cors');
const chatRoutes = require('./routes/chat');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);

app.use(express.json());

// ── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/chat', chatRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SkyAssist Resolution Agent',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// ── Error handler ──────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'An unexpected error occurred.' });
});

app.listen(PORT, () => {
  console.log(`\n🛫  SkyAssist Backend running on http://localhost:${PORT}`);
  console.log(`   Gemini API key: ${process.env.GEMINI_API_KEY ? '✅ configured' : '❌ MISSING — set GEMINI_API_KEY in .env'}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});
