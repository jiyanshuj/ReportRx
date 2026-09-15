import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { extractRouter } from './routes/extract.route';
import { healthRouter } from './routes/health.route';
import { errorHandler } from './middleware/error-handler';

export function createServer() {
  const app = express();
  app.use(cors());
  app.use(healthRouter);
  app.use(extractRouter);
  app.use(errorHandler);
  return app;
}

const app = createServer();

if (require.main === module) {
  app.listen(env.port, () => {
    console.log(`Medical OCR service listening on port ${env.port}`);
  });
}

export default app;