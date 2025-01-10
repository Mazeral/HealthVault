import { Request, Response } from "express";
import prisma from "../utils/prisma";
import bcrypt from "bcrypt";

class AuthController {
  private async hashPassword(pwd: string) {
    try {
      const salt = await bcrypt.genSalt(Number(process.env.SALT));
      const hash = await bcrypt.hash(pwd, salt);
      return hash;
    } catch (error) {
      if (error instanceof Error) throw error;
    }
  }
  /**
   * login
   * @req: A request object from express, contains the request
   * @res: The response request from express
   */
  static async login(req: Request, res: Response) {
    try {
      const name: string = req.body.user;
      const pwd: string = req.body.password;

      // Validate input
      if (!name || !pwd) throw new Error("Username and password required");

      // Fetch the user from the database
      const user = await prisma.user.findFirst({
        where: {
          name: name,
        },
        select: {
          id: true,
          role: true,
          password: true, // Include the password hash in the query
        },
      });

      // Check if the user exists
      if (!user) throw new Error("Invalid credentials");

      // Compare the provided password with the stored hash
      const isPasswordValid = await bcrypt.compare(pwd, user.password);
      if (!isPasswordValid) throw new Error("Invalid credentials");

      // Ensure the session exists
      if (!req.session) throw new Error("Session not available");

      // Initialize `req.session.user` if it doesn't exist
      if (!req.session.user) {
        req.session.user = { id: "", role: "" };
      }

      // Set session properties
      req.session.user.id = String(user.id); // Set `userId`
      req.session.user.role = user.role; // Set `role`

      // Send success response
      res.status(200).json({ login: "success" });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Username and password required") {
          res.status(400).json({ error: error.message });
        } else if (error.message === "Invalid credentials") {
          res.status(401).json({ error: error.message });
        } else {
          res.status(500).json({ error: error.message });
        }
      }
    }
  }
  /**
   * Logout
   * @req: A request object from express, contains the request
   * @res: The response request from express
   */
  static logout(req: Request, res: Response): void {
    try {
      const session = req.session;
      session.destroy(function (err: Error | undefined) {
        if (err) {
          res.status(500).json({ error: "Could not log out" });
          return; // Exit early if there's an error
        }
        res.status(200).json({ logout: "success" });
      });
    } catch (error) {
      res.status(500).json({ error: "Could not log out" });
    }
  }

  /**
   * Check Authentication
   * @req: A request object from express, contains the request
   * @res: The response request from express
   */
  static checkAuth(req: Request, res: Response): void {
    if (!req.session.user?.id) {
      // Check for `req.session.user.id`
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // If authenticated, send user details
    res.status(200).json({
      userId: req.session.user.id,
      role: req.session.user.role,
    });
  }
}

export default AuthController;
