import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// In-memory leaderboard store with pre-seeded champions
let leaderboardStore = [
  { rank: 1, name: 'Ada_Lovelace', score: 14850, xp: 4800, world: 'All Worlds', date: 'Oct 22' },
  { rank: 2, name: 'Grace_Hopper', score: 13920, xp: 4450, world: 'Database Depths', date: 'Oct 21' },
  { rank: 3, name: 'Turing_Enigma', score: 12700, xp: 4100, world: 'Network Nexus', date: 'Oct 20' },
  { rank: 4, name: 'Guido_Python', score: 11450, xp: 3800, world: 'Python Realm', date: 'Oct 19' },
  { rank: 5, name: 'Hinton_Perceptron', score: 9800, xp: 3200, world: 'Neural Citadel', date: 'Oct 18' },
];

// Leaderboard endpoints
app.get('/api/leaderboard', (_req, res) => {
  res.json({ entries: leaderboardStore });
});

app.post('/api/leaderboard', (req, res) => {
  const { name, score, xp, world } = req.body;
  if (name && typeof score === 'number') {
    leaderboardStore.push({
      rank: 0,
      name: String(name).slice(0, 20),
      score,
      xp: xp || 0,
      world: world || 'TechQuest',
      date: 'Today',
    });
    leaderboardStore.sort((a, b) => b.score - a.score);
    leaderboardStore = leaderboardStore.slice(0, 15).map((entry, idx) => ({
      ...entry,
      rank: idx + 1,
    }));
  }
  res.json({ success: true, entries: leaderboardStore });
});

// Gemini AI hint endpoint
app.post('/api/ai-hint', async (req, res) => {
  const { puzzleTitle, puzzleType, prompt, hintLevel, playerInput } = req.body;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    // Graceful fallback if no API key is provided
    return res.json({
      hint: null,
      source: 'offline',
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are Ada, an encouraging and expert AI tutor inside TechQuest, a 2D puzzle adventure game.
The player is stuck on this puzzle:
Puzzle Title: ${puzzleTitle}
Puzzle Type: ${puzzleType}
Prompt: ${prompt}
Hint Level Requested: ${hintLevel} (1=Conceptual nudge, 2=Step-by-step logic, 3=Direct syntax fix)
Current Player Input: "${playerInput || '(none)'}"

Write a concise, friendly, 1-2 sentence hint matched to Hint Level ${hintLevel}. Keep it clear, precise, and directly helpful without giving a giant wall of text.`,
    });

    const text = response.text?.trim() || null;
    return res.json({
      hint: text,
      source: 'gemini',
    });
  } catch (error: any) {
    console.error('Gemini API call failed:', error?.message);
    return res.json({
      hint: null,
      source: 'fallback',
    });
  }
});

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TechQuest server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
