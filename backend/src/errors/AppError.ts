export type AppErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION_ERROR"
  | "INTERNAL_SERVER_ERROR";

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  errorCode: AppErrorCode;
  details?: unknown;

  constructor(
    message: string,
    statusCode: number,
    errorCode: AppErrorCode = "INTERNAL_SERVER_ERROR",
    details?: unknown
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errorCode = errorCode;
    this.details = details;

    Object.setPrototypeOf(this, AppError.prototype);
  }
}


