import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { ENV } from './config.js';
import { publicApi } from './routes/publicApi.js';
import { adminApi } from './routes/adminApi.js';
import { seoRoutes } from './routes/seoRoutes.js';

export async function createApp() {
  const app = express();

  // Middleware Setup
  app.use(cors({ origin: true, credentials: true }));
  app.use(cookieParser());
  app.use(express.json({ limit: '12mb' }));
  app.use(express.urlencoded({ extended: true, limit: '12mb' }));

  // Static Assets from /public
  const publicDir = join(process.cwd(), 'public');
  if (existsSync(publicDir)) {
    app.use(express.static(publicDir, { maxAge: '7d' }));
  }

  // SEO & OpenGraph Routes
  app.use(seoRoutes);

  // API Routes
  app.use('/api', publicApi);
  app.use('/api/admin', adminApi);

  // Vite Integration (Development vs Production)
  if (ENV.NODE_ENV !== 'production') {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (err) {
      console.warn('Vite middleware could not be loaded in dev, serving static if available:', err);
    }
  } else {
    const distDir = join(process.cwd(), 'dist');
    if (existsSync(distDir)) {
      app.use(express.static(distDir, { maxAge: '1d' }));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(join(distDir, 'index.html'));
      });
    }
  }

  // Global Error Handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled Application Error:', err);
    res.status(500).json({ ok: false, error: 'Internal Server Error' });
  });

  return app;
}

