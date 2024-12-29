import { Request, Response } from "express";
import prisma from "../singleton";
import { mockReset } from "jest-mock-extended";
import LabController from "../controllers/LabController";

// mocking the req object through a function that returns an mocking object of express Request
const mockReq = (): Partial<Request> => ({
  params: {},
  body: {},
});

// mocking the res object through a function that returns an mocking object of express Response
const mockRes = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

beforeEach(() => {
  mockReset(prisma);
});

// How does the data be sent from the client
const clientData = {
  id: "1",
  patientId: "1",
  testName: "testName",
  result: "resultName",
  notes: "testNote",
  performedAt: new Date(Date.parse("2000-1-1")),
  createdAt: new Date(Date.parse("2000-1-1")),
};

//How does the server sends the data
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
  it("Should create a new lab result", async () => {
    const req = mockReq();
    const res = mockRes();
    req.body.patientId = clientData.patientId;
    req.body.testName = clientData.testName;
    req.body.result = clientData.result;
    req.body.notes = clientData.notes;
    req.body.performedAt = clientData.performedAt;
    prisma.labResult.create.mockResolvedValue({
      id: 1,
      patientId: 1,
      testName: "testName",
      result: "resultName",
      notes: "testNote",
      performedAt: new Date(Date.parse("2000-1-1")),
      createdAt: new Date(Date.parse("2000-1-1")),
    });

    await LabController.newLabResult(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ "Lab result": serverData });
  });
  it("Should fetch a lab result by id", async () => {
    const req = mockReq();
    const res = mockRes();
    req.params = {};
    req.params.id = clientData.id;

    prisma.labResult.findUnique.mockResolvedValue({
      id: 1,
      patientId: 1,
      testName: "testName",
      result: "resultName",
      notes: "testNote",
      performedAt: new Date(Date.parse("2000-1-1")),
      createdAt: new Date(Date.parse("2000-1-1")),
    });
    await LabController.getLabResult(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ "Lab result": serverData });
  });

  it("Should return all the lab results", async () => {
    const req = mockReq();
    const res = mockRes();
    prisma.labResult.findMany.mockResolvedValue([
      {
        id: 1,
        patientId: 1,
        testName: "testName",
        result: "resultName",
        notes: "testNote",
        performedAt: new Date(Date.parse("2000-1-1")),
        createdAt: new Date(Date.parse("2000-1-1")),
      },
    ]);
    await LabController.allLabResults(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ "Lab results": [serverData] });
  });

  it("Should update a lab result", async () => {
    const req = mockReq();
    const res = mockRes();

    req.body.firstName = "new name";
    req.body.result = "new result";
    req.body.notes = "new notes";
    req.params = {};
    req.params.id = "1";
    prisma.labResult.updateMany.mockResolvedValue({
      count: 1,
    });
    prisma.labResult.update.mockResolvedValue(serverData);
    await LabController.updateLabResult(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ updated: { count: 1 } });
  });
});
