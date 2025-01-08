import { Request, Response, NextFunction } from "express";
import { CustomSessionData } from "../types";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const session = req.session as CustomSessionData; // Cast req.session to CustomSessionData

  // Check if session.user is defined
  if (!session.user) {
    return res
      .status(401)
      .json({ error: "Unauthorized: No user session found" });
  }

  // Check if session.user.id is defined
  if (!session.user.id) {
    return res
      .status(401)
      .json({ error: "Unauthorized: Invalid user session" });
  }

  next(); // User is authenticated, proceed to the next middleware/route
};
