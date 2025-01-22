import { Request, Response } from "express";
import prisma from "./singleton";
import MedRecordController from "../src/controllers/MedRecordController";
import { CustomSessionData } from "../src/types";
import { Role, Sex, BloodGroup } from "@prisma/client";
import { Prisma } from "@prisma/client";

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

// Mock data for Patient
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
  User: {
    // Optional: Mock the related user
    id: 1,
    name: "Doctor",
    email: "doctor@example.com",
    password: "hashedpassword",
    role: Role.DOCTOR, // Use the enum value
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

// Mock data for User
const mockUser = {
  id: 1,
  name: "Doctor",
  email: "doctor@example.com",
  password: "hashedpassword",
  role: Role.DOCTOR, // Use the enum value
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock data for MedicalRecord
const mockMedicalRecord = {
  id: 1,
  patientId: 1,
  diagnosis: "Diagnosis A",
  notes: "Patient notes",
  userId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  patient: {
    // Optional: Mock the related patient
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
  },
  User: {
    // Optional: Mock the related user
    id: 1,
    name: "Doctor",
    email: "doctor@example.com",
    password: "hashedpassword",
    role: Role.DOCTOR, // Use the enum value
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

describe("MedRecordController", () => {
  describe("addRecord", () => {
    it("should add a medical record and return 200", async () => {
      const req = mockReq();
      req.body = {
        patientFullName: "John Doe",
        diagnosis: "Diagnosis A",
        notes: "Patient notes",
      };
      req.session = { user: { id: "1" } } as CustomSessionData;

      const res = mockRes(); // Define res here

      prisma.patient.findUnique.mockResolvedValue(mockPatient);
      prisma.medicalRecord.create.mockResolvedValue(mockMedicalRecord);

      await MedRecordController.addRecord(req as Request, res as Response);

      expect(prisma.patient.findUnique).toHaveBeenCalledWith({
        where: { fullName: "John Doe" },
      });
      expect(prisma.medicalRecord.create).toHaveBeenCalledWith({
        data: {
          patientId: 1,
          diagnosis: "Diagnosis A",
          notes: "Patient notes",
          userId: 1,
        },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ medRecord: mockMedicalRecord });
    });

    it("should return 400 if required fields are missing", async () => {
      const req = mockReq();
      req.body = {
        patientFullName: "John Doe",
        notes: "Patient notes",
      }; // Missing diagnosis

      const res = mockRes(); // Define res here

      await MedRecordController.addRecord(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Missing fields" });
    });

    it("should return 404 if no patient is found", async () => {
      const req = mockReq();
      req.body = {
        patientFullName: "Unknown Patient",
        diagnosis: "Diagnosis A",
        notes: "Patient notes",
      };
      req.session = { user: { id: "1" } } as CustomSessionData;

      const res = mockRes();

      // Mock the response to return null (no patient found)
      prisma.patient.findUnique.mockResolvedValue(null);

      await MedRecordController.addRecord(req as Request, res as Response);

      // Verify the response
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "No patient found" });
    });

    it("should return 500 if an unexpected error occurs", async () => {
      const req = mockReq();
      req.body = {
        patientFullName: "John Doe",
        diagnosis: "Diagnosis A",
        notes: "Patient notes",
      };
      req.session = { user: { id: "1" } } as CustomSessionData;

      const res = mockRes(); // Define res here

      prisma.patient.findUnique.mockRejectedValue(
        new Error("Unexpected error"),
      );

      await MedRecordController.addRecord(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Unexpected error" });
    });
  });

  describe("updateMedRecord", () => {
    it("should update a medical record and return 200", async () => {
      const req = mockReq();
      req.params = { id: "1" };
      req.body = {
        diagnosis: "Updated Diagnosis",
        notes: "Updated Notes",
        patientFullName: "Jane Doe",
      };

      const res = mockRes(); // Define res here

      const mockUpdatedMedicalRecord = {
        ...mockMedicalRecord,
        diagnosis: "Updated Diagnosis",
        notes: "Updated Notes",
        patient: { fullName: "Jane Doe" },
      };

      prisma.medicalRecord.findUnique.mockResolvedValue(mockMedicalRecord);
      prisma.patient.findFirst.mockResolvedValue({
        ...mockPatient,
        fullName: "Jane Doe",
      });
      prisma.medicalRecord.update.mockResolvedValue(mockUpdatedMedicalRecord);

      await MedRecordController.updateMedRecord(
        req as Request,
        res as Response,
      );

      expect(prisma.medicalRecord.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          diagnosis: "Updated Diagnosis",
          notes: "Updated Notes",
          patientId: 1,
        },
        include: { patient: true },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        updated: {
          ...mockUpdatedMedicalRecord,
          patientFullName: "Jane Doe",
        },
      });
    });

    it("should return 404 if no medical record is found", async () => {
      const req = mockReq();
      req.params = { id: "999" }; // ID that does not exist

      const res = mockRes();

      prisma.medicalRecord.delete = mockRejectedValue({
        code: "P2025", // Prisma error code for "not found"
      });

      await MedRecordController.deleteRecord(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Medical record not found",
      });
    });

    it("should return 400 if no id is provided", async () => {
      const req = mockReq();
      const res = mockRes(); // Define res here

      await MedRecordController.updateMedRecord(
        req as Request,
        res as Response,
      );

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "No medical record ID provided",
      });
    });
  });

  describe("getMedRecord", () => {
    it("should fetch a medical record and return 200", async () => {
      const req = mockReq();
      req.params = { id: "1" };

      const res = mockRes(); // Define res here

      const mockMedicalRecordWithUser = {
        ...mockMedicalRecord,
        User: mockUser,
      };

      prisma.medicalRecord.findUnique.mockResolvedValue(
        mockMedicalRecordWithUser,
      );

      await MedRecordController.getMedRecord(req as Request, res as Response);

      expect(prisma.medicalRecord.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { User: true },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        "Medical Record": mockMedicalRecordWithUser,
      });
    });

    it("should return 404 if no medical record is found", async () => {
      const req = mockReq();
      req.params = { id: "1" };

      const res = mockRes(); // Define res here

      prisma.medicalRecord.findUnique.mockResolvedValue(null);

      await MedRecordController.getMedRecord(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Medical record not found",
      });
    });

    it("should return 400 if no id is provided", async () => {
      const req = mockReq();
      const res = mockRes(); // Define res here

      await MedRecordController.getMedRecord(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "No id provided" });
    });
  });

  describe("deleteRecord", () => {
    it("should delete a medical record and return 200", async () => {
      const req = mockReq();
      req.params = { id: "1" };

      const res = mockRes(); // Define res here

      prisma.medicalRecord.delete.mockResolvedValue(mockMedicalRecord);

      await MedRecordController.deleteRecord(req as Request, res as Response);

      expect(prisma.medicalRecord.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: mockMedicalRecord });
    });

    it("should return 404 if no medical record is found", async () => {
      const req = mockReq();
      req.params = { id: "1" };

      const res = mockRes(); // Define res here

      prisma.medicalRecord.delete.mockRejectedValue(
        new Error("Medical record not found"),
      );

      await MedRecordController.deleteRecord(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Medical record not found",
      });
    });

    it("should return 400 if no id is provided", async () => {
      const req = mockReq();
      const res = mockRes(); // Define res here

      await MedRecordController.deleteRecord(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "No id provided" });
    });
  });

  describe("getLabResults", () => {
    it("should fetch lab results and return 200", async () => {
      const req = mockReq();
      const res = mockRes(); // Define res here

      req.body = {
        patientId: 1,
        testName: "Test A",
        result: "Positive",
        notes: "Lab notes",
      };

      const mockLabResults = [
        {
          id: 1,
          patientId: 1,
          testName: "Test A",
          result: "Positive",
          notes: "Lab notes",
          performedAt: new Date(), // Add the missing required field
          userId: 1, // Add the missing required field
          createdAt: new Date(), // Add the missing required field
          updatedAt: new Date(), // Optional: Include if your schema has this field
          patient: {
            // Optional: Mock the related patient
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
          },
          User: {
            // Optional: Mock the related user
            id: 1,
            name: "John Doe",
            email: "john.doe@example.com",
            password: "hashedPassword123",
            role: Role.DOCTOR, // Use the enum value
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      ];

      prisma.labResult.findMany.mockResolvedValue(mockLabResults);

      await MedRecordController.getLabResults(req as Request, res as Response);

      expect(prisma.labResult.findMany).toHaveBeenCalledWith({
        where: {
          patientId: 1,
          testName: "Test A",
          result: "Positive",
          notes: "Lab notes",
        },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        "Lab Results": mockLabResults,
      });
    });

    it("should return 500 if an unexpected error occurs", async () => {
      const req = mockReq();
      req.body = {
        patientId: 1,
        testName: "Test A",
        result: "Positive",
        notes: "Lab notes",
      };

      const res = mockRes(); // Define res here

      prisma.labResult.findMany.mockRejectedValue(
        new Error("Unexpected error"),
      );

      await MedRecordController.getLabResults(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Unexpected error" });
    });
  });

  describe("allLabResults", () => {
    it("should fetch all lab results and return 200", async () => {
      const req = mockReq();
      const res = mockRes(); // Define res here

      const mockLabResults = [
        {
          id: 1,
          patientId: 1,
          testName: "Test A",
          result: "Positive",
          notes: "Lab notes",
          performedAt: new Date(), // Add the missing required field
          userId: 1, // Add the missing required field
          createdAt: new Date(), // Add the missing required field
          updatedAt: new Date(), // Optional: Include if your schema has this field
        },
      ];

      prisma.labResult.findMany.mockResolvedValue(mockLabResults);

      await MedRecordController.allLabResults(req as Request, res as Response);

      expect(prisma.labResult.findMany).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        "Lab Results": mockLabResults,
      });
    });

    it("should return 500 if an unexpected error occurs", async () => {
      const req = mockReq();
      const res = mockRes(); // Define res here

      prisma.labResult.findMany.mockRejectedValue(
        new Error("Unexpected error"),
      );

      await MedRecordController.allLabResults(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Unexpected error" });
    });
  });

  describe("allMedicalRecords", () => {
    it("should fetch all medical records and return 200", async () => {
      const req = mockReq();
      const res = mockRes(); // Define res here

      const mockMedicalRecords = [
        {
          ...mockMedicalRecord,
          patient: { fullName: "John Doe" },
          User: mockUser,
        },
      ];

      prisma.medicalRecord.findMany.mockResolvedValue(mockMedicalRecords);

      await MedRecordController.allMedicalRecords(
        req as Request,
        res as Response,
      );

      expect(prisma.medicalRecord.findMany).toHaveBeenCalledWith({
        include: { patient: { select: { fullName: true } }, User: true },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        "Medical Records": mockMedicalRecords,
      });
    });

    it("should return 500 if an unexpected error occurs", async () => {
      const req = mockReq();
      const res = mockRes(); // Define res here

      prisma.medicalRecord.findMany.mockRejectedValue(
        new Error("Unexpected error"),
      );

      await MedRecordController.allMedicalRecords(
        req as Request,
        res as Response,
      );

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Unexpected error" });
    });
  });

  describe("getMyMedicalRecords", () => {
    it("should fetch medical records for the authenticated user and return 200", async () => {
      const req = mockReq();
      req.session = { user: { id: "1" } } as CustomSessionData;

      const res = mockRes(); // Define res here

      const mockMedicalRecords = [
        {
          ...mockMedicalRecord,
          patient: mockPatient,
        },
      ];

      prisma.medicalRecord.findMany.mockResolvedValue(mockMedicalRecords);

      await MedRecordController.getMyMedicalRecords(
        req as Request,
        res as Response,
      );

      expect(prisma.medicalRecord.findMany).toHaveBeenCalledWith({
        where: { patient: { userId: 1 } },
        include: { patient: true },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        medicalRecords: mockMedicalRecords,
      });
    });

    it("should return 401 if user ID is missing in session", async () => {
      const req = mockReq();
      req.session = {} as CustomSessionData; // No user ID

      const res = mockRes(); // Define res here

      await MedRecordController.getMyMedicalRecords(
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

      const res = mockRes(); // Define res here

      prisma.medicalRecord.findMany.mockRejectedValue(
        new Error("Unexpected error"),
      );

      await MedRecordController.getMyMedicalRecords(
        req as Request,
        res as Response,
      );

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Unexpected error" });
    });
  });
});
