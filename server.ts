import path from 'path';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import app from './backend/src/app';

const PORT = 3000;
const HOST = '0.0.0.0';

async function startServer() {
  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    console.log('📦 Running in DEVELOPMENT mode. Initializing Vite middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    // Mount Vite's dev asset handles AFTER our backend APIs
    app.use(vite.middlewares);
  } else {
    console.log('🚀 Running in PRODUCTION mode. Serving pre-compiled static assets...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`=========================================`);
    console.log(`🎓 KOROGRADE FULLSTACK RUNNING SUCCESSFUL`);
    console.log(`🌐 Server URL: http://localhost:${PORT}`);
    console.log(`🔒 Port binding: ${HOST}:${PORT}`);
    console.log(`=========================================`);
  });
}

startServer().catch((err) => {
  console.error('❌ Failed to start the KoroGrade server:', err);
});
