import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './server/apiRoutes.js';
import { coordinatorAgent } from './server/agents/coordinatorAgent.js';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // JSON Body Parser
  app.use(express.json());

  // API Routes FIRST
  app.use('/api', apiRouter);

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
    console.log(`LifeLink Emergency Coordinator running on http://0.0.0.0:${PORT}`);

    // Seed default hero scenario non-blockingly after server is listening
    coordinatorAgent
      .seedDefaultScenarios()
      .then(() => {
        console.log('Seeded default LifeLink Hero Emergency Scenario (Bangalore Road Accident)');
      })
      .catch((err) => {
        console.warn('Initial seeding note:', err);
      });
  });
}

startServer();
