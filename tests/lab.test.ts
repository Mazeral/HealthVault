import { Request, Response } from "express";
import prisma from "../singleton";
import { mockReset } from "jest-mock-extended";
import LabController from "../controllers/LabController";

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
  mockReset(prisma);
});

// Mock data
const clientData = {
  id: "1",
  patientId: "1",
  testName: "testName",
  result: "resultName",
  notes: "testNote",
  performedAt: new Date(Date.parse("2000-1-1")),
  createdAt: new Date(Date.parse("2000-1-1")),
};

const serverData = {
  id: 1,
  patientId: 1,
  testName: "testName",
  result: "resultName",
  notes: "testNote",
  performedAt: new Date(Date.parse("2000-1-1")),
  createdAt: new Date(Date.parse("2000-1-1")),
};

describe("LabController", () => {
  describe("newLabResult", () => {
    it("should create a new lab result and return 200", async () => {
      const req = mockReq();
      const res = mockRes();
      req.body = clientData;

      prisma.labResult.create.mockResolvedValue(serverData);

      await LabController.newLabResult(req as Request, res as Response);

      expect(prisma.labResult.create).toHaveBeenCalledWith({
        data: {
          testName: clientData.testName,
          result: clientData.result,
          notes: clientData.notes,
          performedAt: clientData.performedAt.toISOString(),
          patient: {
            connect: { id: Number(clientData.patientId) },
          },
        },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ "Lab result": serverData });
    });

    it("should return 400 if required fields are missing", async () => {
      const req = mockReq();
      const res = mockRes();
      req.body = {}; // Missing required fields

      await LabController.newLabResult(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    });

    it("should return 500 if an unexpected error occurs", async () => {
      const req = mockReq();
      const res = mockRes();
      req.body = clientData;

      prisma.labResult.create.mockRejectedValue(new Error("Unexpected error"));

      await LabController.newLabResult(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Unexpected error" });
    });
  });

  describe("getLabResult", () => {
    it("should fetch a lab result by id and return 200", async () => {
      const req = mockReq();
      const res = mockRes();
      req.params.id = clientData.id;

      prisma.labResult.findUnique.mockResolvedValue(serverData);

      await LabController.getLabResult(req as Request, res as Response);

      expect(prisma.labResult.findUnique).toHaveBeenCalledWith({
        where: { id: Number(clientData.id) },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ "Lab result": serverData });
    });

    it("should return 400 if lab result ID is missing", async () => {
      const req = mockReq();
      const res = mockRes();
      req.params.id = ""; // Missing ID

      await LabController.getLabResult(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "No lab result ID provided",
      });
    });

    it("should return 500 if an unexpected error occurs", async () => {
      const req = mockReq();
      const res = mockRes();
      req.params.id = clientData.id;

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

      prisma.labResult.findMany.mockResolvedValue([serverData]);

      await LabController.allLabResults(req as Request, res as Response);

      expect(prisma.labResult.findMany).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ "Lab results": [serverData] });
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
      req.params.id = clientData.id;
      req.body = { testName: "updatedTestName", result: "updatedResult" };

      prisma.labResult.updateMany.mockResolvedValue({ count: 1 });

      await LabController.updateLabResult(req as Request, res as Response);

      expect(prisma.labResult.updateMany).toHaveBeenCalledWith({
        where: { id: Number(clientData.id) },
        data: { testName: "updatedTestName", result: "updatedResult" },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ updated: { count: 1 } });
    });

    it("should return 400 if lab result ID is missing", async () => {
      const req = mockReq();
      const res = mockRes();
      req.params.id = ""; // Missing ID

      await LabController.updateLabResult(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Lab test ID not provided",
      });
    });

    it("should return 500 if an unexpected error occurs", async () => {
      const req = mockReq();
      const res = mockRes();
      req.params.id = clientData.id;
      req.body = { testName: "updatedTestName", result: "updatedResult" };

      prisma.labResult.updateMany.mockRejectedValue(
        new Error("Unexpected error"),
      );

      await LabController.updateLabResult(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Unexpected error" });
    });
  });

  describe("deleteLabResult", () => {
    it("should delete a lab result and return 200", async () => {
      const req = mockReq();
      const res = mockRes();
      req.params.id = clientData.id;

      prisma.labResult.delete.mockResolvedValue(serverData);

      await LabController.deleteLabResult(req as Request, res as Response);

      expect(prisma.labResult.delete).toHaveBeenCalledWith({
        where: { id: Number(clientData.id) },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ result: serverData });
    });

    it("should return 400 if lab result ID is missing", async () => {
      const req = mockReq();
      const res = mockRes();
      req.params.id = ""; // Missing ID

      await LabController.deleteLabResult(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Bad request" });
    });

    it("should return 500 if an unexpected error occurs", async () => {
      const req = mockReq();
      const res = mockRes();
      req.params.id = clientData.id;

      prisma.labResult.delete.mockRejectedValue(new Error("Unexpected error"));

      await LabController.deleteLabResult(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Unexpected error" });
    });
  });
});
