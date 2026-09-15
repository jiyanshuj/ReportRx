import type { ErrorRequestHandler } from 'express';
import { AppError } from '../utils/errors';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // Unexpected errors: log full detail server-side, return a generic
  // message to the client (no stack traces leaked in the response).
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
};
