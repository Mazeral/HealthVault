import { Request, Response } from "express";
import prisma from "./singleton";
import UserController from "../src/controllers/UserController";
import bcrypt from "bcrypt";
import { Role, Sex, BloodGroup } from '@prisma/client';

// Mock bcrypt
jest.mock("bcrypt");

// Mocking the req object
const mockReq = (): Partial<Request> => ({
  params: {},
  body: {},
});

// Mocking the res object
const mockRes = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

beforeEach(() => {
  jest.clearAllMocks(); // Clear all mocks before each test
});


// Mock data for User
const mockUser = {
  id: 1,
  name: "John Doe",
  email: "john.doe@example.com",
  password: "hashedPassword123",
  role: Role.DOCTOR, // Use the enum value
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock data for Patient
const mockPatient = {
  id: 1,
  fullName: "Jane Doe",
  dateOfBirth: new Date("1990-01-01"),
  phone: "1234567890",
  email: "jane.doe@example.com",
  address: "123 Main St",
  sex: Sex.FEMALE, // Use the enum value
  bloodGroup: BloodGroup.A_PLUS, // Use the enum value
  userId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("UserController", () => {
  describe("newUser", () => {
    it("should create a new user and return 200", async () => {
      const req = mockReq();
      req.body = {
        name: "John Doe",
        email: "john.doe@example.com",
        password: "password123",
        role: "DOCTOR",
      };

      const res = mockRes();
      const hashedPassword = "hashedPassword123";
      (bcrypt.genSalt as jest.Mock).mockResolvedValue("salt");
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      prisma.user.create.mockResolvedValue(mockUser);

      await UserController.newUser(req as Request, res as Response);

      expect(bcrypt.hash).toHaveBeenCalledWith("password123", "salt");
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          name: "John Doe",
          email: "john.doe@example.com",
          password: hashedPassword,
          role: "DOCTOR",
        },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ newUser: mockUser });
    });

    it("should return 400 if required fields are missing", async () => {
      const req = mockReq();
      req.body = {
        email: "john.doe@example.com",
        password: "password123",
      }; // Missing name and role

      const res = mockRes();

      await UserController.newUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Missing required fields",
      });
    });

    it("should return 409 if email already exists", async () => {
      const req = mockReq();
      req.body = {
        name: "John Doe",
        email: "john.doe@example.com",
        password: "password123",
        role: "DOCTOR",
      };

      const res = mockRes();
      prisma.user.findUnique.mockResolvedValue(mockUser);

      await UserController.newUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        error: "Email already exists",
      });
    });

    it("should return 500 if an unexpected error occurs", async () => {
      const req = mockReq();
      req.body = {
        name: "John Doe",
        email: "john.doe@example.com",
        password: "password123",
        role: "DOCTOR",
      };

      const res = mockRes();
      prisma.user.findUnique.mockRejectedValue(new Error("Unexpected error"));

      await UserController.newUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Unexpected error" });
    });
  });

  describe("getUser", () => {
    it("should fetch a user by id and return 200", async () => {
      const req = mockReq();
      req.params = { id: "1" };

      const res = mockRes();
      prisma.user.findUnique.mockResolvedValue(mockUser);

      await UserController.getUser(req as Request, res as Response);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          patients: true,
          medicalRecords: true,
          prescriptions: true,
          labResults: true,
        },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ user: mockUser });
    });

    it("should return 400 if no id is provided", async () => {
      const req = mockReq();
      const res = mockRes();

      await UserController.getUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "No ID provided" });
    });

    it("should return 404 if no user is found", async () => {
      const req = mockReq();
      req.params = { id: "1" };

      const res = mockRes();
      prisma.user.findUnique.mockResolvedValue(null);

      await UserController.getUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
    });
  });

  describe("allUsers", () => {
    it("should fetch all users and return 200", async () => {
      const req = mockReq();
      const res = mockRes();

      prisma.user.findMany.mockResolvedValue([mockUser]);

      await UserController.allUsers(req as Request, res as Response);

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        include: {
          patients: true,
          medicalRecords: true,
          prescriptions: true,
          labResults: true,
        },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ users: [mockUser] });
    });

    it("should return 500 if an unexpected error occurs", async () => {
      const req = mockReq();
      const res = mockRes();

      prisma.user.findMany.mockRejectedValue(new Error("Unexpected error"));

      await UserController.allUsers(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Failed to fetch users" });
    });
  });

  describe("updateUser", () => {
    it("should update a user and return 200", async () => {
      const req = mockReq();
      req.params = { id: "1" };
      req.body = {
        name: "Jane Doe",
        email: "jane.doe@example.com",
        password: "newPassword123",
        role: "ADMIN",
      };

      const res = mockRes();
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.user.update.mockResolvedValue({
        ...mockUser,
        name: "Jane Doe",
        email: "jane.doe@example.com",
      });

      await UserController.updateUser(req as Request, res as Response);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          name: "Jane Doe",
          email: "jane.doe@example.com",
          password: expect.any(String), // Hashed password
          role: "ADMIN",
        },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        updated: {
          ...mockUser,
          name: "Jane Doe",
          email: "jane.doe@example.com",
        },
      });
    });

    it("should return 400 if no id is provided", async () => {
      const req = mockReq();
      const res = mockRes();

      await UserController.updateUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "No ID provided" });
    });

    it("should return 404 if no user is found", async () => {
      const req = mockReq();
      req.params = { id: "1" };

      const res = mockRes();
      prisma.user.findUnique.mockResolvedValue(null);

      await UserController.updateUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
    });
  });

  describe("addPatient", () => {
    it("should add a patient to the user and return 200", async () => {
      const req = mockReq();
      req.params = { id: "1" };
      req.body = { patientId: "2" };

      const res = mockRes();
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.user.update.mockResolvedValue({
        ...mockUser,
        patients: [mockPatient],
      });

      await UserController.addPatient(req as Request, res as Response);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          patients: {
            connect: { id: 2 },
          },
        },
        include: {
          patients: true,
        },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        updated: {
          ...mockUser,
          patients: [mockPatient],
        },
      });
    });

    it("should return 400 if no patient id is provided", async () => {
      const req = mockReq();
      const res = mockRes();

      await UserController.addPatient(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Missing required fields",
      });
    });

    it("should return 404 if no user is found", async () => {
      const req = mockReq();
      req.params = { id: "1" };
      req.body = { patientId: "2" };

      const res = mockRes();
      prisma.user.findUnique.mockResolvedValue(null);

      await UserController.addPatient(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
    });
  });

  describe("deleteUser", () => {
    it("should delete a user and return 200", async () => {
      const req = mockReq();
      req.params = { id: "1" };

      const res = mockRes();
      prisma.user.delete.mockResolvedValue(mockUser);

      await UserController.deleteUser(req as Request, res as Response);

      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ result: mockUser });
    });

    it("should return 400 if no id is provided", async () => {
      const req = mockReq();
      const res = mockRes();

      await UserController.deleteUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "No ID provided" });
    });
  });

  describe("getAllDoctors", () => {
    it("should fetch all doctors and return 200", async () => {
      const req = mockReq();
      const res = mockRes();

      prisma.user.findMany.mockResolvedValue([mockUser]);

      await UserController.getAllDoctors(req as Request, res as Response);

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { role: "DOCTOR" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ doctors: [mockUser] });
    });

    it("should return 500 if an unexpected error occurs", async () => {
      const req = mockReq();
      const res = mockRes();

      prisma.user.findMany.mockRejectedValue(new Error("Unexpected error"));

      await UserController.getAllDoctors(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Failed to fetch doctors" });
    });
  });

  describe("editDoctor", () => {
    it("should update a doctor and return 200", async () => {
      const req = mockReq();
      req.params = { id: "1" };
      req.body = {
        name: "Jane Doe",
        email: "jane.doe@example.com",
      };

      const res = mockRes();
      prisma.user.update.mockResolvedValue({
        ...mockUser,
        name: "Jane Doe",
        email: "jane.doe@example.com",
      });

      await UserController.editDoctor(req as Request, res as Response);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1, role: "DOCTOR" },
        data: { name: "Jane Doe", email: "jane.doe@example.com" },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        updated: {
          ...mockUser,
          name: "Jane Doe",
          email: "jane.doe@example.com",
        },
      });
    });

    it("should return 400 if required fields are missing", async () => {
      const req = mockReq();
      req.params = { id: "1" };
      req.body = {
        name: "Jane Doe",
      }; // Missing email

      const res = mockRes();

      await UserController.editDoctor(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Missing required fields",
      });
    });

    it("should return 500 if an unexpected error occurs", async () => {
      const req = mockReq();
      req.params = { id: "1" };
      req.body = {
        name: "Jane Doe",
        email: "jane.doe@example.com",
      };

      const res = mockRes();
      prisma.user.update.mockRejectedValue(new Error("Unexpected error"));

      await UserController.editDoctor(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Failed to update doctor" });
    });
  });

  describe("deleteDoctor", () => {
    it("should delete a doctor and return 200", async () => {
      const req = mockReq();
      req.params = { id: "1" };

      const res = mockRes();
      prisma.user.delete.mockResolvedValue(mockUser);

      await UserController.deleteDoctor(req as Request, res as Response);

      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: 1, role: "DOCTOR" },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Doctor deleted successfully",
      });
    });

    it("should return 400 if no id is provided", async () => {
      const req = mockReq();
      const res = mockRes();

      await UserController.deleteDoctor(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Missing user ID" });
    });

    it("should return 500 if an unexpected error occurs", async () => {
      const req = mockReq();
      req.params = { id: "1" };

      const res = mockRes();
      prisma.user.delete.mockRejectedValue(new Error("Unexpected error"));

      await UserController.deleteDoctor(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Failed to delete doctor" });
    });
  });

  describe("getMyPatients", () => {
    it("should fetch patients for a doctor and return 200", async () => {
      const req = mockReq();
      req.params = { doctorId: "1" };

      const res = mockRes();
      prisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        patients: [mockPatient],
      });

      await UserController.getMyPatients(req as Request, res as Response);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1, role: "DOCTOR" },
        include: { patients: true },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ patients: [mockPatient] });
    });

    it("should return 400 if no doctor id is provided", async () => {
      const req = mockReq();
      const res = mockRes();

      await UserController.getMyPatients(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "No doctor ID provided" });
    });

    it("should return 404 if no doctor is found", async () => {
      const req = mockReq();
      req.params = { doctorId: "1" };

      const res = mockRes();
      prisma.user.findUnique.mockResolvedValue(null);

      await UserController.getMyPatients(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Doctor not found" });
    });
  });

  describe("getDoctorDetails", () => {
    it("should fetch detailed data for a doctor and return 200", async () => {
      const req = mockReq();
      req.params = { id: "1" };

      const res = mockRes();
      prisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        patients: [mockPatient],
        medicalRecords: [],
        prescriptions: [],
        labResults: [],
      });

      await UserController.getDoctorDetails(req as Request, res as Response);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1, role: "DOCTOR" },
        include: {
          patients: true,
          medicalRecords: true,
          prescriptions: true,
          labResults: true,
        },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        patients: [mockPatient],
        medicalRecords: [],
        prescriptions: [],
        labResults: [],
      });
    });

    it("should return 400 if no id is provided", async () => {
      const req = mockReq();
      const res = mockRes();

      await UserController.getDoctorDetails(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "No ID provided" });
    });

    it("should return 404 if no doctor is found", async () => {
      const req = mockReq();
      req.params = { id: "1" };

      const res = mockRes();
      prisma.user.findUnique.mockResolvedValue(null);

      await UserController.getDoctorDetails(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Doctor not found" });
    });
  });
});
