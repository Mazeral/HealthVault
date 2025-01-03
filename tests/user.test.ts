import { Request, Response } from "express";
import prisma from "./singleton";
import UserController from "../src/controllers/UserController";
import bcrypt from "bcrypt";

// Mock the Prisma client
jest.mock("../src/utils/prisma");

// Mock bcrypt
jest.mock("bcrypt");

// Mock the request and response objects
const mockReq = (): Partial<Request> => ({
  params: {},
  body: {},
});

const mockRes = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("UserController", () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear all mocks before each test
  });

  describe("newUser", () => {
    it("should create a new user and return 200", async () => {
      const req = mockReq();
      req.body = {
        email: "test@example.com",
        password: "password123",
        role: "admin",
        patients: [1, 2],
      };

      const res = mockRes();
      const hashedPassword = "hashedPassword123";
      (bcrypt.genSalt as jest.Mock).mockResolvedValue("salt");
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 1,
        email: "test@example.com",
        password: hashedPassword,
        role: "admin",
      });

      await UserController.newUser(req as Request, res as Response);

      expect(bcrypt.hash).toHaveBeenCalledWith("password123", "salt");
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: "test@example.com",
          password: hashedPassword,
          role: "admin",
          patients: {
            connect: [{ id: 1 }, { id: 2 }],
          },
        },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        "new user:": {
          id: 1,
          email: "test@example.com",
          password: hashedPassword,
          role: "admin",
        },
      });
    });

    it("should return 400 if a required field is missing", async () => {
      const req = mockReq();
      req.body = {
        email: "test@example.com",
        password: "password123",
      }; // Missing role

      const res = mockRes();

      await UserController.newUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Missing field" });
    });
  });

  describe("getUser", () => {
    it("should return a user by id and return 200", async () => {
      const req = mockReq();
      req.params = { id: "1" };

      const res = mockRes();
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        email: "test@example.com",
      });

      await UserController.getUser(req as Request, res as Response);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        user: { id: 1, email: "test@example.com" },
      });
    });

    it("should return 400 if no id is provided", async () => {
      const req = mockReq();
      const res = mockRes();

      await UserController.getUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "No id provided" });
    });

    it("should return 404 if no user is found", async () => {
      const req = mockReq();
      req.params = { id: "1" };

      const res = mockRes();
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await UserController.getUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "No user found" });
    });
  });

  describe("allUsers", () => {
    it("should return all users and return 200", async () => {
      const req = mockReq();
      const res = mockRes();
      (prisma.user.findMany as jest.Mock).mockResolvedValue([
        { id: 1, email: "test@example.com" },
      ]);

      await UserController.allUsers(req as Request, res as Response);

      expect(prisma.user.findMany).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        users: [{ id: 1, email: "test@example.com" }],
      });
    });
  });

  describe("updateUser", () => {
    it("should update a user and return 200", async () => {
      const req = mockReq();
      req.params = { id: "1" };
      req.body = {
        email: "updated@example.com",
        password: "newPassword123",
        role: "user",
      };

      const res = mockRes();
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (prisma.user.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      await UserController.updateUser(req as Request, res as Response);

      expect(prisma.user.updateMany).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          email: "updated@example.com",
          password: "newPassword123",
          role: "user",
        },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ updated: { count: 1 } });
    });

    it("should return 400 if no id is provided", async () => {
      const req = mockReq();
      const res = mockRes();

      await UserController.updateUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "No id provided" });
    });

    it("should return 404 if no user is found", async () => {
      const req = mockReq();
      req.params = { id: "1" };

      const res = mockRes();
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await UserController.updateUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "No user found" });
    });
  });

  describe("addPatient", () => {
    it("should add a patient to the user and return 200", async () => {
      const req = mockReq();
      req.params = { id: "1" };
      req.body = { id: "2" };

      const res = mockRes();
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (prisma.user.update as jest.Mock).mockResolvedValue({ id: 1 });

      await UserController.addPatient(req as Request, res as Response);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          patients: {
            connect: { id: 2 },
          },
        },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ updated: { id: 1 } });
    });

    it("should return 400 if no patient id is provided", async () => {
      const req = mockReq();
      const res = mockRes();

      await UserController.addPatient(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "No patient id provided",
      });
    });

    it("should return 404 if no user is found", async () => {
      const req = mockReq();
      req.params = { id: "1" };
      req.body = { id: "2" };

      const res = mockRes();
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await UserController.addPatient(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "No user found" });
    });
  });

  describe("deleteUser", () => {
    it("should delete a user and return 200", async () => {
      const req = mockReq();
      req.params = { id: "1" };

      const res = mockRes();
      (prisma.user.delete as jest.Mock).mockResolvedValue({ id: 1 });

      await UserController.deleteUser(req as Request, res as Response);

      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ result: { id: 1 } });
    });

    it("should return 400 if no user id is provided", async () => {
      const req = mockReq();
      const res = mockRes();

      await UserController.deleteUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "No user ID" });
    });
  });
});
