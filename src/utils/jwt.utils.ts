import { Request } from "express";

const re = /(\S+)\s+(\S+)/;

export const extractJwt = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (authHeader == null) return null;

  const matches = authHeader.match(re);
  if (matches == null) return null;

  if (matches[1].toLowerCase() !== "bearer") return null;

  return matches[2];

};