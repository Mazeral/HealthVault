import { mockDeep, mockReset } from "jest-mock-extended";
import { Request, Response } from "express";
import PatientController from "../src/controllers/PatientController";
import prisma from "./singleton";
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
  mockReset(prisma);
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

const mockUser = {
  id: 1,
  name: "Doctor",
  email: "doctor@example.com",
  password: "hashedpassword",
  role: Role.DOCTOR, // Use the enum value
  createdAt: new Date(),
  updatedAt: new Date(),
};
describe("PatientController", () => {
  describe("newPatient", () => {
    it("should create a new patient and return 200", async () => {
      const req = mockReq();
      req.body = {
        fullName: "John Doe",
        dateOfBirth: "1990-01-01",
        phone: "1234567890",
        email: "john.doe@example.com",
        address: "123 Main St",
        sex: "MALE",
        bloodGroup: "A_PLUS",
      };
      req.session = { user: { id: "1" } } as CustomSessionData;

      prisma.patient.create.mockResolvedValue(mockPatient);

      await PatientController.newPatient(req as Request, res as Response);

      expect(prisma.patient.create).toHaveBeenCalledWith({
        data: {
          fullName: "John Doe",
          dateOfBirth: new Date("1990-01-01"),
          phone: "1234567890",
          email: "john.doe@example.com",
          address: "123 Main St",
          sex: "MALE",
          bloodGroup: "A_PLUS",
          userId: 1,
        },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ "Patient data:": mockPatient });
    });

    it("should return 400 if fullName or sex is missing", async () => {
      const req = mockReq();
      req.body = {
        fullName: "John Doe",
      }; // Missing sex

      const res = mockRes();

      await PatientController.newPatient(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Full name is required" });
    });

    it("should return 500 if an unexpected error occurs", async () => {
      const req = mockReq();
      req.body = {
        fullName: "John Doe",
        sex: "MALE",
      };
      req.session = { user: { id: "1" } } as CustomSessionData;

      prisma.patient.create.mockRejectedValue(new Error("Unexpected error"));

      await PatientController.newPatient(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Unexpected error" });
    });
  });

  describe("getPatient", () => {
    it("should fetch a patient by id and return 200", async () => {
      const req = mockReq();
      req.params = { id: "1" };

      const mockPatientWithUser = {
        ...mockPatient,
        User: mockUser,
      };

      prisma.patient.findUnique.mockResolvedValue(mockPatientWithUser);

      await PatientController.getPatient(req as Request, res as Response);

      expect(prisma.patient.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { User: true },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        patient: {
          ...mockPatientWithUser,
          createdBy: "Doctor",
        },
      });
    });

    it("should return 400 if no id is provided", async () => {
      const req = mockReq();
      const res = mockRes();

      await PatientController.getPatient(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "No ID provided from getPatient" });
    });

    it("should return 404 if no patient is found", async () => {
      const req = mockReq();
      req.params = { id: "1" };

      const res = mockRes();
      prisma.patient.findUnique.mockResolvedValue(null);

      await PatientController.getPatient(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "No patient found" });
    });
  });

  describe("updatePatient", () => {
    it("should update a patient and return 200", async () => {
      const req = mockReq();
      req.params = { id: "1" };
      req.body = {
        fullName: "Jane Doe",
        dateOfBirth: "1995-01-01",
        phone: "0987654321",
        email: "jane.doe@example.com",
        address: "456 Elm St",
        sex: "FEMALE",
        bloodGroup: "B_PLUS",
      };

      const mockUpdatedPatient = {
        ...mockPatient,
        fullName: "Jane Doe",
        dateOfBirth: new Date("1995-01-01"),
        phone: "0987654321",
        email: "jane.doe@example.com",
        address: "456 Elm St",
        sex: "FEMALE",
        bloodGroup: "B_PLUS",
        User: mockUser,
      };

      prisma.patient.findUnique.mockResolvedValue(mockPatient);
      prisma.patient.update.mockResolvedValue(mockUpdatedPatient);

      await PatientController.updatePatient(req as Request, res as Response);

      expect(prisma.patient.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          fullName: "Jane Doe",
          dateOfBirth: new Date("1995-01-01"),
          phone: "0987654321",
          email: "jane.doe@example.com",
          address: "456 Elm St",
          sex: "FEMALE",
          bloodGroup: "B_PLUS",
        },
        include: { User: true },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        updated: {
          ...mockUpdatedPatient,
          createdBy: "Doctor",
        },
      });
    });

    it("should return 400 if no id is provided", async () => {
      const req = mockReq();
      const res = mockRes();

      await PatientController.updatePatient(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "No ID provided from updatePatient" });
    });

    it("should return 404 if no patient is found", async () => {
      const req = mockReq();
      req.params = { id: "1" };

      const res = mockRes();
      prisma.patient.findUnique.mockResolvedValue(null);

      await PatientController.updatePatient(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "No patient found" });
    });
  });

  describe("getPatients", () => {
    it("should fetch all patients and return 200", async () => {
      const req = mockReq();
      const res = mockRes();

      const mockPatients = [
        {
          ...mockPatient,
          User: mockUser,
        },
      ];

      prisma.patient.findMany.mockResolvedValue(mockPatients);

      await PatientController.getPatients(req as Request, res as Response);

      expect(prisma.patient.findMany).toHaveBeenCalledWith({
        include: { User: true },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: [
          {
            ...mockPatient,
            createdBy: "Doctor",
          },
        ],
      });
    });

    it("should return 500 if an unexpected error occurs", async () => {
      const req = mockReq();
      const res = mockRes();

      prisma.patient.findMany.mockRejectedValue(new Error("Unexpected error"));

      await PatientController.getPatients(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Unexpected error" });
    });
  });

  describe("addRecord", () => {
    it("should add a medical record for a patient and return 200", async () => {
      const req = mockReq();
      req.params = { id: "1" };
      req.body = {
        diagnosis: "Diagnosis A",
        notes: "Patient notes",
      };
      req.session = { user: { id: "1" } } as CustomSessionData;

      const mockMedicalRecord = {
        id: 1,
        diagnosis: "Diagnosis A",
        notes: "Patient notes",
        patientId: 1,
        userId: 1,
      };

      prisma.patient.findUnique.mockResolvedValue(mockPatient);
      prisma.medicalRecord.create.mockResolvedValue(mockMedicalRecord);

      await PatientController.addRecord(req as Request, res as Response);

      expect(prisma.medicalRecord.create).toHaveBeenCalledWith({
        data: {
          diagnosis: "Diagnosis A",
          notes: "Patient notes",
          patientId: 1,
          userId: 1,
        },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ updated: mockMedicalRecord });
    });

    it("should return 400 if no id is provided", async () => {
      const req = mockReq();
      const res = mockRes();

      await PatientController.addRecord(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "No ID provided from addRecord" });
    });

    it("should return 404 if no patient is found", async () => {
      const req = mockReq();
      req.params = { id: "1" };

      const res = mockRes();
      prisma.patient.findUnique.mockResolvedValue(null);

      await PatientController.addRecord(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "No patient found" });
    });
  });

  describe("getLabResults", () => {
    it("should fetch lab results for a patient and return 200", async () => {
      const req = mockReq();
      req.params = { id: "1" };

      const mockLabResults = [
        {
          id: 1,
          testName: "Test A",
          result: "Positive",
          notes: "Lab notes",
          patientId: 1,
          userId: 1,
        },
      ];

      prisma.patient.findUnique.mockResolvedValue(mockPatient);
      prisma.labResult.findMany.mockResolvedValue(mockLabResults);

      await PatientController.getLabResults(req as Request, res as Response);

      expect(prisma.labResult.findMany).toHaveBeenCalledWith({
        where: { patientId: 1 },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ "Lab Results": mockLabResults });
    });

    it("should return 400 if no id is provided", async () => {
      const req = mockReq();
      const res = mockRes();

      await PatientController.getLabResults(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "No ID provided from getLabResults" });
    });

    it("should return 404 if no patient is found", async () => {
      const req = mockReq();
      req.params = { id: "1" };

      const res = mockRes();
      prisma.patient.findUnique.mockResolvedValue(null);

      await PatientController.getLabResults(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "No patient found" });
    });
  });
});
