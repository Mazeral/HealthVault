import { Request, Response } from "express";
import prisma from "./singleton";
import PrescriptionController from "../src/controllers/PrescriptionController";
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
  res.status = jest.fn().mockReturnValue(res); // Chainable
  res.json = jest.fn().mockReturnValue(res); // Chainable
  return res;
};

beforeEach(() => {
  jest.clearAllMocks(); // Clear all mocks before each test
});

import { Role, Sex, BloodGroup } from '@prisma/client';

const mockPatient = {
  id: 1,
  fullName: "John Doe",
  dateOfBirth: new Date("1990-01-01"),
  phone: "1234567890",
  email: "john.doe@example.com",
  address: "123 Main St",
  sex: Sex.MALE, // Use the enum value
  bloodGroup: BloodGroup.A_PLUS, // Use the enum value
  userId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrescription = {
  id: 1,
  patientId: 1,
  medication: "Medication A",
  dosage: "500mg",
  instructions: "Take once daily",
  prescribedAt: new Date(), // Add the missing required field
  userId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  patient: { // Optional: Mock the related patient
    id: 1,
    fullName: "John Doe",
    dateOfBirth: new Date("1990-01-01"),
    phone: "1234567890",
    email: "john.doe@example.com",
    address: "123 Main St",
    sex: "MALE", // Or use the enum: Sex.MALE
    bloodGroup: "A_PLUS", // Or use the enum: BloodGroup.A_PLUS
    userId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  User: { // Optional: Mock the related user
    id: 1,
    name: "Doctor",
    email: "doctor@example.com",
    password: "hashedpassword",
    role: "DOCTOR", // Or use the enum: Role.DOCTOR
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};
describe("PrescriptionController", () => {
  describe("newPrescription", () => {
    it("should create a new prescription and return 200", async () => {
      const req = mockReq();
      req.body = {
        patientFullName: "John Doe",
        medication: "Medication A",
        dosage: "500mg",
        instructions: "Take once daily",
      };
      req.session = { user: { id: "1" } } as CustomSessionData;

      prisma.patient.findFirst.mockResolvedValue(mockPatient);
      prisma.prescription.create.mockResolvedValue(mockPrescription);

      await PrescriptionController.newPrescription(
        req as Request,
        res as Response,
      );

      expect(prisma.patient.findFirst).toHaveBeenCalledWith({
        where: { fullName: "John Doe", userId: 1 },
      });
      expect(prisma.prescription.create).toHaveBeenCalledWith({
        data: {
          patientId: 1,
          medication: "Medication A",
          dosage: "500mg",
          instructions: "Take once daily",
          userId: 1,
        },
        include: { patient: true },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ prescription: mockPrescription });
    });

    it("should return 400 if required fields are missing", async () => {
      const req = mockReq();
      req.body = {
        patientFullName: "John Doe",
        medication: "Medication A",
      }; // Missing dosage

      const res = mockRes();

      await PrescriptionController.newPrescription(
        req as Request,
        res as Response,
      );

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Missing required fields",
      });
    });

    it("should return 404 if no patient is found", async () => {
      const req = mockReq();
      req.body = {
        patientFullName: "Unknown Patient",
        medication: "Medication A",
        dosage: "500mg",
      };
      req.session = { user: { id: "1" } } as CustomSessionData;

      prisma.patient.findFirst.mockResolvedValue(null);

      await PrescriptionController.newPrescription(
        req as Request,
        res as Response,
      );

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "No patient found" });
    });

    it("should return 500 if an unexpected error occurs", async () => {
      const req = mockReq();
      req.body = {
        patientFullName: "John Doe",
        medication: "Medication A",
        dosage: "500mg",
      };
      req.session = { user: { id: "1" } } as CustomSessionData;

      prisma.patient.findFirst.mockRejectedValue(new Error("Unexpected error"));

      await PrescriptionController.newPrescription(
        req as Request,
        res as Response,
      );

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Unexpected error" });
    });
  });

  describe("getPrescription", () => {
    it("should fetch a prescription by id and return 200", async () => {
      const req = mockReq();
      req.params = { id: "1" };

      const mockPrescriptionWithUser = {
        ...mockPrescription,
        User: mockUser,
      };

      prisma.prescription.findUnique.mockResolvedValue(mockPrescriptionWithUser);

      await PrescriptionController.getPrescription(
        req as Request,
        res as Response,
      );

      expect(prisma.prescription.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { User: true },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        prescription: mockPrescriptionWithUser,
      });
    });

    it("should return 404 if no prescription is found", async () => {
      const req = mockReq();
      req.params = { id: "1" };

      const res = mockRes();
      prisma.prescription.findUnique.mockResolvedValue(null);

      await PrescriptionController.getPrescription(
        req as Request,
        res as Response,
      );

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Prescription not found" });
    });

    it("should return 400 if no id is provided", async () => {
      const req = mockReq();
      const res = mockRes();

      await PrescriptionController.getPrescription(
        req as Request,
        res as Response,
      );

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "No ID provided" });
    });
  });

  describe("allPrescriptions", () => {
    it("should fetch all prescriptions and return 200", async () => {
      const req = mockReq();
      const res = mockRes();

      const mockPrescriptions = [
        {
          ...mockPrescription,
          patient: { fullName: "John Doe" },
          User: mockUser,
        },
      ];

      prisma.prescription.findMany.mockResolvedValue(mockPrescriptions);

      await PrescriptionController.allPrescriptions(
        req as Request,
        res as Response,
      );

      expect(prisma.prescription.findMany).toHaveBeenCalledWith({
        include: { patient: { select: { fullName: true } }, User: true },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        prescriptions: mockPrescriptions,
      });
    });

    it("should return 500 if an unexpected error occurs", async () => {
      const req = mockReq();
      const res = mockRes();

      prisma.prescription.findMany.mockRejectedValue(
        new Error("Unexpected error"),
      );

      await PrescriptionController.allPrescriptions(
        req as Request,
        res as Response,
      );

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Unexpected error" });
    });
  });

  describe("updatePrescription", () => {
    it("should update a prescription and return 200", async () => {
      const req = mockReq();
      req.params = { id: "1" };
      req.body = {
        patientFullName: "Jane Doe",
        medication: "Medication B",
        dosage: "1000mg",
        instructions: "Take twice daily",
      };

      const mockUpdatedPrescription = {
        ...mockPrescription,
        patient: { fullName: "Jane Doe" },
      };

      prisma.prescription.findUnique.mockResolvedValue(mockPrescription);
      prisma.patient.findFirst.mockResolvedValue({
        ...mockPatient,
        fullName: "Jane Doe",
      });
      prisma.prescription.update.mockResolvedValue(mockUpdatedPrescription);

      await PrescriptionController.updatePrescription(
        req as Request,
        res as Response,
      );

      expect(prisma.prescription.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          patientId: 1,
          medication: "Medication B",
          dosage: "1000mg",
          instructions: "Take twice daily",
        },
        include: { patient: true },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        updated: {
          ...mockUpdatedPrescription,
          patientFullName: "Jane Doe",
        },
      });
    });

    it("should return 404 if no prescription is found", async () => {
      const req = mockReq();
      req.params = { id: "1" };

      const res = mockRes();
      prisma.prescription.findUnique.mockResolvedValue(null);

      await PrescriptionController.updatePrescription(
        req as Request,
        res as Response,
      );

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Prescription not found" });
    });

    it("should return 400 if no id is provided", async () => {
      const req = mockReq();
      const res = mockRes();

      await PrescriptionController.updatePrescription(
        req as Request,
        res as Response,
      );

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "No ID provided" });
    });
  });

  describe("deletePrescription", () => {
    it("should delete a prescription and return 200", async () => {
      const req = mockReq();
      req.params = { id: "1" };

      const res = mockRes();
      prisma.prescription.delete.mockResolvedValue(mockPrescription);

      await PrescriptionController.deletePrescription(
        req as Request,
        res as Response,
      );

      expect(prisma.prescription.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Prescription deleted successfully",
      });
    });

    it("should return 404 if no prescription is found", async () => {
      const req = mockReq();
      req.params = { id: "1" };

      const res = mockRes();
      prisma.prescription.delete.mockRejectedValue(
        new Error("Prescription not found"),
      );

      await PrescriptionController.deletePrescription(
        req as Request,
        res as Response,
      );

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Prescription not found" });
    });

    it("should return 400 if no id is provided", async () => {
      const req = mockReq();
      const res = mockRes();

      await PrescriptionController.deletePrescription(
        req as Request,
        res as Response,
      );

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "No ID provided" });
    });
  });

  describe("getMyPrescriptions", () => {
    it("should fetch prescriptions for the authenticated user and return 200", async () => {
      const req = mockReq();
      req.session = { user: { id: "1" } } as CustomSessionData;

      const mockPrescriptions = [
        {
          ...mockPrescription,
          patient: { fullName: "John Doe" },
        },
      ];

      prisma.prescription.findMany.mockResolvedValue(mockPrescriptions);

      await PrescriptionController.getMyPrescriptions(
        req as Request,
        res as Response,
      );

      expect(prisma.prescription.findMany).toHaveBeenCalledWith({
        where: { patient: { userId: 1 } },
        include: { patient: { select: { fullName: true } } },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ prescriptions: mockPrescriptions });
    });

    it("should return 401 if user ID is missing in session", async () => {
      const req = mockReq();
      req.session = {} as CustomSessionData; // No user ID

      const res = mockRes();

      await PrescriptionController.getMyPrescriptions(
        req as Request,
        res as Response,
      );

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Unauthorized: No user ID found in session",
      });
    });

    it("should return 500 if an unexpected error occurs", async () => {
      const req = mockReq();
      req.session = { user: { id: "1" } } as CustomSessionData;

      prisma.prescription.findMany.mockRejectedValue(
        new Error("Unexpected error"),
      );

      await PrescriptionController.getMyPrescriptions(
        req as Request,
        res as Response,
      );

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Unexpected error" });
    });
  });
});
