import express from 'express';
import cookieParser from 'cookie-parser';
import apiRouter from './routes.js';

export function createApp(): express.Express {
  const app = express();

  app.set('trust proxy', 1);
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api', apiRouter);

  return app;
}
