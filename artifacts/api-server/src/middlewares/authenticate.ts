import { type Request, type Response, type NextFunction } from "express";
import { verifyToken } from "../lib/auth";

declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const token = auth.slice(7);
  try {
    const { userId } = verifyToken(token);
    req.userId = userId;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
