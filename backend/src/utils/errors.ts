export class AppError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(400, message);
  }
}

export class UnprocessableEntityError extends AppError {
  constructor(message: string) {
    super(422, message);
  }
}

export class UpstreamOcrError extends AppError {
  constructor(message: string) {
    super(500, message);
  }
}
