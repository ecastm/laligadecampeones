import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import type { UserRole } from "@shared/schema";

const JWT_SECRET = process.env.SESSION_SECRET;
if (!JWT_SECRET) {
  console.error("ERROR: SESSION_SECRET environment variable is required for JWT security");
  process.exit(1);
}
const JWT_SECRET_VALUE = JWT_SECRET as string;

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET_VALUE, { expiresIn: "7d" });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET_VALUE) as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }

  req.user = payload;
  next();
}

export function authorizeRoles(...roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "No autenticado" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "No tienes permisos para esta acción" });
    }
    next();
  };
}
