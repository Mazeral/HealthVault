import { Request, Response } from "express";
import prisma from './singleton'
import MedRecordController from "../src/controllers/MedRecordController";

// Mock the Prisma client
jest.mock("../src/utils/prisma");

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

describe("MedRecordController", () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear all mocks before each test
  });

  describe("addRecord", () => {
    it("should add a medical record and return 200", async () => {
      const req = mockReq();
      req.body = {
        patientId: 1,
        diagnosis: "Diagnosis A",
        notes: "Patient notes",
      };

      const res = mockRes();
      (prisma.medicalRecord.create as jest.Mock).mockResolvedValue({
        id: 1,
        patientId: 1,
        diagnosis: "Diagnosis A",
        notes: "Patient notes",
      });

      await MedRecordController.addRecord(req as Request, res as Response);

      expect(prisma.medicalRecord.create).toHaveBeenCalledWith({
        data: {
          patientId: 1,
          diagnosis: "Diagnosis A",
          notes: "Patient notes",
        },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: {
          id: 1,
          patientId: 1,
          diagnosis: "Diagnosis A",
          notes: "Patient notes",
        },
      });
    });

    it("should return 400 if any field is missing", async () => {
      const req = mockReq();
      req.body = {
        patientId: 1,
        notes: "some not",
      }; // missing diagnosis

      const res = mockRes();

      await MedRecordController.addRecord(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Missing fields" });
    });
  });

  describe("updateMedRecord", () => {
    it("should update a medical record and return 200", async () => {
      const req = mockReq();
      req.params = { id: "1" };
      req.body = {
        diagnosis: "Updated Diagnosis",
        notes: "Updated Notes",
        patientId: 2,
      };

      const res = mockRes();
      (prisma.patient.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (prisma.medicalRecord.updateMany as jest.Mock).mockResolvedValue({
        count: 1,
      });
      (prisma.medicalRecord.update as jest.Mock).mockResolvedValue({ id: 1 });

      await MedRecordController.updateMedRecord(
        req as Request,
        res as Response,
      );

      expect(prisma.medicalRecord.updateMany).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          diagnosis: "Updated Diagnosis",
          notes: "Updated Notes",
          patientId: 2,
        },
      });
      expect(prisma.medicalRecord.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: {
          patient: {
            connect: {
              id: 2,
            },
          },
        },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ updated: { count: 1 } });
    });

    it("should return 400 if no id is provided", async () => {
      const req = mockReq();
      const res = mockRes();

      await MedRecordController.updateMedRecord(
        req as Request,
        res as Response,
      );

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "No id provided" });
    });

    it("should return 404 if no patient is found", async () => {
      const req = mockReq();
      req.params = { id: "1" };

      const res = mockRes();
      (prisma.patient.findUnique as jest.Mock).mockResolvedValue(null);

      await MedRecordController.updateMedRecord(
        req as Request,
        res as Response,
      );

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "No patient found" });
    });
  });

  describe("getMedRecord", () => {
    it("should fetch a medical record and return 200", async () => {
      const req = mockReq();
      req.params = { id: "1" };

      const res = mockRes();
      (prisma.medicalRecord.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        patientId: 1,
        diagnosis: "Diagnosis A",
        notes: "Patient notes",
      });

      await MedRecordController.getMedRecord(req as Request, res as Response);

      expect(prisma.medicalRecord.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        "Medical Record": {
          id: 1,
          patientId: 1,
          diagnosis: "Diagnosis A",
          notes: "Patient notes",
        },
      });
    });

    it("should return 400 if no id is provided", async () => {
      const req = mockReq();
      const res = mockRes();

      await MedRecordController.getMedRecord(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "No id provided" });
    });

    it("should return 404 if no medical record is found", async () => {
      const req = mockReq();
      req.params = { id: "1" };

      const res = mockRes();
      (prisma.medicalRecord.findUnique as jest.Mock).mockResolvedValue(null);

      await MedRecordController.getMedRecord(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Medical record not found",
      });
    });
  });

  describe("deleteRecord", () => {
    it("should delete a medical record and return 200", async () => {
      const req = mockReq();
      req.params = { id: "1" };

      const res = mockRes();
      (prisma.medicalRecord.delete as jest.Mock).mockResolvedValue({ id: 1 });

      await MedRecordController.deleteRecord(req as Request, res as Response);

      expect(prisma.medicalRecord.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: { id: 1 } });
    });

    it("should return 400 if no id is provided", async () => {
      const req = mockReq();
      const res = mockRes();

      await MedRecordController.deleteRecord(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "No id provided" });
    });
  });

  describe("getLabResults", () => {
    it("should fetch lab results and return 200", async () => {
      const req = mockReq();
      req.body = {
        patientId: 1,
        testName: "Test A",
        result: "Positive",
        notes: "Lab notes",
      };

      const res = mockRes();
      (prisma.labResult.findMany as jest.Mock).mockResolvedValue([
        {
          id: 1,
          patientId: 1,
          testName: "Test A",
          result: "Positive",
          notes: "Lab notes",
        },
      ]);

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
        "Lab Results": [
          {
            id: 1,
            patientId: 1,
            testName: "Test A",
            result: "Positive",
            notes: "Lab notes",
          },
        ],
      });
    });
  });

  describe("allLabResults", () => {
    it("should fetch all lab results and return 200", async () => {
      const req = mockReq();
      const res = mockRes();
      (prisma.labResult.findMany as jest.Mock).mockResolvedValue([
        {
          id: 1,
          patientId: 1,
          testName: "Test A",
          result: "Positive",
          notes: "Lab notes",
        },
      ]);

      await MedRecordController.allLabResults(req as Request, res as Response);

      expect(prisma.labResult.findMany).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        "Lab Results": [
          {
            id: 1,
            patientId: 1,
            testName: "Test A",
            result: "Positive",
            notes: "Lab notes",
          },
        ],
      });
    });
  });
});
