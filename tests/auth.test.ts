import request from "supertest";
import { Request, Response } from "express";
import AuthController from "../src/controllers/AuthController";
import bcrypt from "bcrypt";
import prisma from "./singleton";
import { Session, SessionData } from "express-session";
import { CustomSession } from "../src/types/index";
import { authMiddleware } from "../src/middlewares/AuthMiddleware";

jest.mock("bcrypt");

// Extend the SessionData interface to include custom properties
declare module "express-session" {
  interface SessionData {
    userId?: string;
    role?: string;
  }
}

// Utility function to create a mock request
function createMockRequest(): Partial<Request> {
  const mockSession = {
    id: "mock-session-id", // Required by the Session interface
    cookie: {
      originalMaxAge: null,
      httpOnly: true,
      secure: false,
      path: "/",
      sameSite: "lax",
    },
    destroy: jest.fn((callback: (err?: Error) => void) => callback()), // Mock destroy method
    regenerate: jest.fn((callback: (err?: Error) => void) => callback()), // Mock regenerate method
    reload: jest.fn((callback: (err?: Error) => void) => callback()), // Mock reload method
    resetMaxAge: jest.fn(), // Mock resetMaxAge method
    save: jest.fn((callback: (err?: Error) => void) => callback()), // Mock save method
    touch: jest.fn(), // Mock touch method
    userId: undefined, // Custom property
    role: undefined, // Custom property
  };

  return {
    body: {},
    session: mockSession as unknown as Session, // Cast to Session to satisfy TypeScript
  };
}

describe("AuthController", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = createMockRequest();
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

      // Mock the session
      req.session = {
        user: { id: "", role: "" }, // Initialize `req.session.user`
        id: "mock-session-id",
        cookie: {
          originalMaxAge: null,
          httpOnly: true,
          secure: false,
          path: "/",
          sameSite: "lax",
        },
        destroy: jest.fn((callback: (err?: Error) => void) => callback()),
        regenerate: jest.fn((callback: (err?: Error) => void) => callback()),
        reload: jest.fn((callback: (err?: Error) => void) => callback()),
        resetMaxAge: jest.fn(),
        save: jest.fn((callback: (err?: Error) => void) => callback()),
        touch: jest.fn(),
      } as unknown as Session;

      await AuthController.login(req as Request, res as Response);

      expect(req.session?.user?.id).toBe("1"); // Check `req.session.user.id`
      expect(req.session?.user?.role).toBe("user"); // Check `req.session.user.role`
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ login: "success" });
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
      AuthController.logout(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ logout: "success" });
    });

    it("should return 500 if logout fails", () => {
      (req.session?.destroy as jest.Mock).mockImplementation((callback) =>
        callback(new Error("Logout failed")),
      );

      AuthController.logout(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Could not log out" });
    });
  });

  describe("checkAuth", () => {
    it("should return 401 if user is not authenticated", () => {
      req.session = {
        id: "mock-session-id",
        cookie: {
          originalMaxAge: null,
          httpOnly: true,
          secure: false,
          path: "/",
          sameSite: "lax",
        },
        destroy: jest.fn((callback: (err?: Error) => void) => callback()),
        regenerate: jest.fn((callback: (err?: Error) => void) => callback()),
        reload: jest.fn((callback: (err?: Error) => void) => callback()),
        resetMaxAge: jest.fn(),
        save: jest.fn((callback: (err?: Error) => void) => callback()),
        touch: jest.fn(),
        userId: undefined,
        role: undefined,
      } as unknown as Session;

      AuthController.checkAuth(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" });
    });

    it("should return 200 with user details if authenticated", () => {
      req.session = {
        user: { id: "1", role: "user" }, // Set `req.session.user`
        id: "mock-session-id",
        cookie: {
          originalMaxAge: null,
          httpOnly: true,
          secure: false,
          path: "/",
          sameSite: "lax",
        },
        destroy: jest.fn((callback: (err?: Error) => void) => callback()),
        regenerate: jest.fn((callback: (err?: Error) => void) => callback()),
        reload: jest.fn((callback: (err?: Error) => void) => callback()),
        resetMaxAge: jest.fn(),
        save: jest.fn((callback: (err?: Error) => void) => callback()),
        touch: jest.fn(),
      } as unknown as Session;

      AuthController.checkAuth(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ userId: "1", role: "user" });
    });
  });
});

it("should allow access if the user is authenticated", () => {
  const req = {
    session: {
      user: { id: "123", role: "user" }, // Set `req.session.user`
      cookie: {
        originalMaxAge: null,
        httpOnly: true,
        secure: false,
        path: "/",
        sameSite: "lax",
      },
      id: "session-id",
      regenerate: jest.fn(),
      destroy: jest.fn(),
      reload: jest.fn(),
      save: jest.fn(),
      touch: jest.fn(),
    } as CustomSession,
  } as Request;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  const next = jest.fn();

  // Call the middleware
  authMiddleware(req, res, next);

  // Assertions
  expect(next).toHaveBeenCalled();
});
