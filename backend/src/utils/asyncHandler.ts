import { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * A controller handler that may be async. Generic over the request type so
 * both plain `Request` and extended types (e.g. `AuthRequest`) are accepted.
 */
type AsyncRequestHandler<P extends Request = Request> = (
  req: P,
  res: Response,
  next: NextFunction
) => Promise<unknown>;

/**
 * Wraps an async Express handler so any rejected promise is forwarded to the
 * global error middleware instead of crashing the process.
 */
export const asyncHandler = <P extends Request = Request>(
  fn: AsyncRequestHandler<P>
): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req as P, res, next)).catch(next);
  };
};

