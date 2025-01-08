import request from "supertest";
import { Request, Response } from "express";
import AuthController from "../src/controllers/AuthController";
import prisma from "./singleton";
import bcrypt from "bcrypt";

jest.mock("bcrypt");

describe("AuthController", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      body: {},
      session: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("login", () => {
    it("should return 400 if username or password is missing", async () => {
      req.body = {};

      await AuthController.login(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Username and password required",
      });
    });

    it("should return 401 if credentials are invalid", async () => {
      req.body = { user: "testuser", password: "wrongpassword" };
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      await AuthController.login(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid credentials" });
    });

    it("should return 200 and set session if credentials are valid", async () => {
      req.body = { user: "testuser", password: "correctpassword" };
      const mockUser = { id: 1, role: "user" };
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedpassword");

      await AuthController.login(req as Request, res as Response);

      expect(req.session.userId).toBe("1");
      expect(req.session.role).toBe("user");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ loign: "success" });
    });

    it("should return 500 if an error occurs", async () => {
      req.body = { user: "testuser", password: "correctpassword" };
      (prisma.user.findFirst as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );

      await AuthController.login(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
    });
  });

  describe("logout", () => {
    it("should return 200 on successful logout", () => {
      req.session.destroy = jest.fn((callback) => callback(null));

      AuthController.logout(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ logout: "success" });
    });

    it("should return 500 if logout fails", () => {
      req.session.destroy = jest.fn((callback) =>
        callback(new Error("Logout failed")),
      );

      AuthController.logout(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Could not log out" });
    });
  });

  describe("checkAuth", () => {
    it("should return 401 if user is not authenticated", () => {
      req.session = {};

      AuthController.checkAuth(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" });
    });

    it("should return 200 with user details if authenticated", () => {
      req.session = { userId: "1", role: "user" };

      AuthController.checkAuth(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ userId: "1", role: "user" });
    });
  });
});
