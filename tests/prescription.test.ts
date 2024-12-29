import { Request, Response } from "express";
import prisma from "../utils/prisma";
import PrescriptionController from "../controllers/PrescriptionController";

// Mock the Prisma client
jest.mock("../utils/prisma");

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

describe("PrescriptionController", () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear all mocks before each test
  });

  describe("newPrescription", () => {
    it("should create a new prescription and return 200", async () => {
      const req = mockReq();
      req.body = {
        patientId: 1,
        medication: "Medication A",
        dosage: "500mg",
        instructions: "Take once daily",
      };

      const res = mockRes();
      (prisma.prescription.create as jest.Mock).mockResolvedValue({
        id: 1,
        patientId: 1,
        medication: "Medication A",
        dosage: "500mg",
        instructions: "Take once daily",
      });

      await PrescriptionController.newPrescription(
        req as Request,
        res as Response,
      );

      expect(prisma.prescription.create).toHaveBeenCalledWith({
        data: {
          patientId: 1,
          medication: "Medication A",
          dosage: "500mg",
          instructions: "Take once daily",
          patient: {
            connect: {
              id: 1,
            },
          },
        },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        prescription: {
          id: 1,
          patientId: 1,
          medication: "Medication A",
          dosage: "500mg",
          instructions: "Take once daily",
        },
      });
    });

    it("should return 400 if patientId is missing", async () => {
      const req = mockReq();
      req.body = {
        medication: "Medication A",
        dosage: "500mg",
        instructions: "Take once daily",
      };

      const res = mockRes();

      await PrescriptionController.newPrescription(
        req as Request,
        res as Response,
      );

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "No patientId provided" });
    });

    it("should return 400 if medication is missing", async () => {
      const req = mockReq();
      req.body = {
        patientId: 1,
        dosage: "500mg",
        instructions: "Take once daily",
      };

      const res = mockRes();

      await PrescriptionController.newPrescription(
        req as Request,
        res as Response,
      );

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "No medication provided",
      });
    });

    it("should return 400 if dosage is missing", async () => {
      const req = mockReq();
      req.body = {
        patientId: 1,
        medication: "Medication A",
        instructions: "Take once daily",
      };

      const res = mockRes();

      await PrescriptionController.newPrescription(
        req as Request,
        res as Response,
      );

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "No dosage provided" });
    });
  });

  describe("getPrescription", () => {
    it("should fetch a prescription by id and return 200", async () => {
      const req = mockReq();
      req.params = { id: "1" };

      const res = mockRes();
      (prisma.prescription.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        patientId: 1,
        medication: "Medication A",
        dosage: "500mg",
        instructions: "Take once daily",
      });

      await PrescriptionController.getPrescription(
        req as Request,
        res as Response,
      );

      expect(prisma.prescription.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        prescription: {
          id: 1,
          patientId: 1,
          medication: "Medication A",
          dosage: "500mg",
          instructions: "Take once daily",
        },
      });
    });

    it("should return 400 if no prescription ID is provided", async () => {
      const req = mockReq();
      const res = mockRes();

      await PrescriptionController.getPrescription(
        req as Request,
        res as Response,
      );

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "No prescription ID provided",
      });
    });
  });

  describe("allPrescriptions", () => {
    it("should fetch all prescriptions and return 200", async () => {
      const req = mockReq();
      const res = mockRes();
      (prisma.prescription.findMany as jest.Mock).mockResolvedValue([
        {
          id: 1,
          patientId: 1,
          medication: "Medication A",
          dosage: "500mg",
          instructions: "Take once daily",
        },
      ]);

      await PrescriptionController.allPrescriptions(
        req as Request,
        res as Response,
      );

      expect(prisma.prescription.findMany).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        prescriptions: [
          {
            id: 1,
            patientId: 1,
            medication: "Medication A",
            dosage: "500mg",
            instructions: "Take once daily",
          },
        ],
      });
    });
  });

  describe("updatePrescription", () => {
    it("should update a prescription and return 200", async () => {
      const req = mockReq();
      req.params = { id: "1" };
      req.body = {
        patientId: 2,
        medication: "Medication B",
        dosage: "1000mg",
        instructions: "Take twice daily",
      };

      const res = mockRes();
      (prisma.prescription.updateMany as jest.Mock).mockResolvedValue({
        count: 1,
      });
      (prisma.prescription.update as jest.Mock).mockResolvedValue({ id: 1 });

      await PrescriptionController.updatePrescription(
        req as Request,
        res as Response,
      );

      expect(prisma.prescription.updateMany).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          patientId: 2,
          medication: "Medication B",
          dosage: "1000mg",
          instructions: "Take twice daily",
        },
      });
      expect(prisma.prescription.update).toHaveBeenCalledWith({
        where: { id: 1 },
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

    it("should return 400 if no prescription ID is provided", async () => {
      const req = mockReq();
      const res = mockRes();

      await PrescriptionController.updatePrescription(
        req as Request,
        res as Response,
      );

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Prescription ID not provided",
      });
    });
  });

  describe("deletePrescription", () => {
    it("should delete a prescription and return 200", async () => {
      const req = mockReq();
      req.params = { id: "1" };

      const res = mockRes();
      (prisma.prescription.delete as jest.Mock).mockResolvedValue({ id: 1 });

      await PrescriptionController.deletePrescription(
        req as Request,
        res as Response,
      );

      expect(prisma.prescription.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ result: { id: 1 } });
    });
  });
});
