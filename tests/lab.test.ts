import { Request, Response } from "express";
import prisma from "./singleton";
import { mockReset } from "jest-mock-extended";
import LabController from "../src/controllers/LabController";
import { CustomSessionData } from "../src/types";

// Mocking the req object
const mockReq = (): Partial<Request> => ({
  params: {},
  body: {},
  session: {} as CustomSessionData,
});

// Mocking the res object
const mockRes = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

beforeEach(() => {
  mockReset(prisma);
});

// Mock data
import { Sex, BloodGroup } from "@prisma/client"; // Import the correct enums

const mockPatient = {
  id: 1,
  fullName: "John Doe",
  userId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  sex: Sex.MALE, // Use the correct enum value
  bloodGroup: BloodGroup.A_PLUS, // Use the correct enum value
  dateOfBirth: null,
  phone: null,
  email: null,
  address: null,
};

const mockLabResult = {
  id: 1,
  testName: "Blood Test",
  result: "Normal",
  notes: "No issues",
  performedAt: new Date(),
  createdAt: new Date(),
  patientId: 1,
  userId: 1,
};

const mockUser = {
  id: 1,
  name: "Doctor",
  email: "doctor@example.com",
  password: "hashedpassword",
  role: "DOCTOR",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("LabController", () => {
  describe("newLabResult", () => {
    it("should create a new lab result and return 200", async () => {
      const req = mockReq();
      const res = mockRes();
      req.body = {
        patientFullName: "John Doe",
        testName: "Blood Test",
        result: "Normal",
        notes: "No issues",
        performedAt: new Date().toISOString(),
      };
      req.session = { user: { id: "1" } } as CustomSessionData;

      prisma.patient.findFirst.mockResolvedValue(mockPatient);
      prisma.labResult.create.mockResolvedValue(mockLabResult);

      await LabController.newLabResult(req as Request, res as Response);

      expect(prisma.patient.findFirst).toHaveBeenCalledWith({
        where: { fullName: "John Doe" },
      });
      expect(prisma.labResult.create).toHaveBeenCalledWith({
        data: {
          testName: "Blood Test",
          result: "Normal",
          notes: "No issues",
          performedAt: expect.any(String),
          patient: { connect: { id: 1 } },
          User: { connect: { id: 1 } },
        },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ "Lab result": mockLabResult });
    });

    it("should return 400 if required fields are missing", async () => {
      const req = mockReq();
      const res = mockRes();
      req.body = {}; // Missing required fields

      await LabController.newLabResult(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    });

    it("should return 400 if patient is not found", async () => {
      const req = mockReq();
      const res = mockRes();
      req.body = {
        patientFullName: "Unknown Patient",
        testName: "Blood Test",
        result: "Normal",
      };
      req.session = { user: { id: "1" } } as CustomSessionData;

      prisma.patient.findFirst.mockResolvedValue(null);

      await LabController.newLabResult(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Patient not found" });
    });

    it("should return 500 if an unexpected error occurs", async () => {
      const req = mockReq();
      const res = mockRes();
      req.body = {
        patientFullName: "John Doe",
        testName: "Blood Test",
        result: "Normal",
      };
      req.session = { user: { id: "1" } } as CustomSessionData;

      prisma.patient.findFirst.mockRejectedValue(new Error("Unexpected error"));

      await LabController.newLabResult(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Unexpected error" });
    });
  });

  describe("getLabResult", () => {
    it("should fetch a lab result by id and return 200", async () => {
      const req = mockReq();
      const res = mockRes();
      req.params = { id: "1" };

      const mockLabResultWithUser = {
        ...mockLabResult,
        User: mockUser,
      };

      prisma.labResult.findUnique.mockResolvedValue(mockLabResultWithUser);

      await LabController.getLabResult(req as Request, res as Response);

      expect(prisma.labResult.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { User: true },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        "Lab result": mockLabResultWithUser,
      });
    });

    it("should return 400 if lab result ID is missing", async () => {
      const req = mockReq();
      const res = mockRes();
      req.params = { id: "" };

      await LabController.getLabResult(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "No lab result ID provided",
      });
    });

    it("should return 500 if an unexpected error occurs", async () => {
      const req = mockReq();
      const res = mockRes();
      req.params = { id: "1" };

      prisma.labResult.findUnique.mockRejectedValue(
        new Error("Unexpected error"),
      );

      await LabController.getLabResult(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Unexpected error" });
    });
  });

  describe("allLabResults", () => {
    it("should fetch all lab results and return 200", async () => {
      const req = mockReq();
      const res = mockRes();

      const mockLabResults = [
        {
          ...mockLabResult,
          patient: { fullName: "John Doe" },
          User: mockUser,
        },
      ];

      prisma.labResult.findMany.mockResolvedValue(mockLabResults);

      await LabController.allLabResults(req as Request, res as Response);

      expect(prisma.labResult.findMany).toHaveBeenCalledWith({
        include: { patient: { select: { fullName: true } }, User: true },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ "Lab results": mockLabResults });
    });

    it("should return 500 if an unexpected error occurs", async () => {
      const req = mockReq();
      const res = mockRes();

      prisma.labResult.findMany.mockRejectedValue(
        new Error("Unexpected error"),
      );

      await LabController.allLabResults(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Unexpected error" });
    });
  });

  describe("updateLabResult", () => {
    it("should update a lab result and return 200", async () => {
      const req = mockReq();
      const res = mockRes();
      req.params = { id: "1" };
      req.body = { testName: "Updated Test", result: "Updated Result" };

      const mockUpdatedResult = {
        ...mockLabResult,
        testName: "Updated Test",
        result: "Updated Result",
        patient: { fullName: "John Doe" },
      };

      prisma.labResult.update.mockResolvedValue(mockUpdatedResult);

      await LabController.updateLabResult(req as Request, res as Response);

      expect(prisma.labResult.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { testName: "Updated Test", result: "Updated Result" },
        include: { patient: true },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        updated: { ...mockUpdatedResult, patientFullName: "John Doe" },
      });
    });

    it("should return 400 if lab result ID is missing", async () => {
      const req = mockReq();
      const res = mockRes();
      req.params = { id: "" };

      await LabController.updateLabResult(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Lab test ID not provided",
      });
    });

    it("should return 500 if an unexpected error occurs", async () => {
      const req = mockReq();
      const res = mockRes();
      req.params = { id: "1" };
      req.body = { testName: "Updated Test", result: "Updated Result" };

      prisma.labResult.update.mockRejectedValue(new Error("Unexpected error"));

      await LabController.updateLabResult(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Unexpected error" });
    });
  });

  describe("deleteLabResult", () => {
    it("should delete a lab result and return 200", async () => {
      const req = mockReq();
      const res = mockRes();
      req.params = { id: "1" };

      prisma.labResult.delete.mockResolvedValue(mockLabResult);

      await LabController.deleteLabResult(req as Request, res as Response);

      expect(prisma.labResult.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ result: mockLabResult });
    });

    it("should return 400 if lab result ID is missing", async () => {
      const req = mockReq();
      const res = mockRes();
      req.params = { id: "" };

      await LabController.deleteLabResult(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Bad request" });
    });

    it("should return 500 if an unexpected error occurs", async () => {
      const req = mockReq();
      const res = mockRes();
      req.params = { id: "1" };

      prisma.labResult.delete.mockRejectedValue(new Error("Unexpected error"));

      await LabController.deleteLabResult(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Unexpected error" });
    });
  });

  describe("getMyLabResults", () => {
    it("should fetch lab results for the authenticated user and return 200", async () => {
      const req = mockReq();
      const res = mockRes();
      req.session = { user: { id: "1" } } as CustomSessionData;

      const mockLabResults = [
        {
          ...mockLabResult,
          patient: { fullName: "John Doe" },
        },
      ];

      prisma.labResult.findMany.mockResolvedValue(mockLabResults);

      await LabController.getMyLabResults(req as Request, res as Response);

      expect(prisma.labResult.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        include: { patient: { select: { fullName: true } } },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ labResults: mockLabResults });
    });

    it("should return 401 if user ID is missing in session", async () => {
      const req = mockReq();
      const res = mockRes();
      req.session = {} as CustomSessionData; // No user ID

      await LabController.getMyLabResults(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Unauthorized: No user ID found in session",
      });
    });

    it("should return 500 if an unexpected error occurs", async () => {
      const req = mockReq();
      const res = mockRes();
      req.session = { user: { id: "1" } } as CustomSessionData;

      prisma.labResult.findMany.mockRejectedValue(
        new Error("Unexpected error"),
      );

      await LabController.getMyLabResults(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Unexpected error" });
    });
  });
});
