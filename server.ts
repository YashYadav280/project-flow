import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

// Routes
import authRoutes from './src/server/routes/authRoutes.js';
import projectRoutes from './src/server/routes/projectRoutes.js';
import taskRoutes from './src/server/routes/taskRoutes.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Database Connection
  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (MONGODB_URI && (MONGODB_URI.startsWith('mongodb://') || MONGODB_URI.startsWith('mongodb+srv://'))) {
    try {
      await mongoose.connect(MONGODB_URI);
      console.log('✅ Connected to MongoDB');
    } catch (err) {
      console.error('❌ MongoDB connection error:', err);
    }
  } else {
    console.warn('⚠️ No valid MONGODB_URI found. Database features will be unavailable.');
    console.info('To fix this, add MONGODB_URI to your environment variables (e.g., mongodb://localhost:27017/projectflow).');
  }

  // Middleware
  app.use(cors());
  app.use(express.json());

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/tasks', taskRoutes);

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'ProjectFlow API is running' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer();
