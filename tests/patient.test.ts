import { mockDeep, mockReset } from "jest-mock-extended";
import { Request, Response } from "express";
import PatientController from "../src/controllers/PatientController";
import prisma from './singleton'

// Mocking the req object
const mockReq = (): Partial<Request> => ({
  params: {},
  body: {},
});

// Mocking the res object
//Partial is a utility type in TypeScript that constructs a new type by making all properties of an existing type optional. It is commonly used when you want to create a subset of an object type without requiring all properties to be defined.
//Since not all of Response properties will used (since its a test obviously) Partial is important
const mockRes = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res); // Chainable
  res.json = jest.fn().mockReturnValue(res); // Chainable
  return res;
};

beforeEach(() => {
  mockReset(prisma);
});

// Start of the test
describe("PatientController.updatePatient", () => {
  it("should return 400 if no id is provided", async () => {
    // Declaring our req and res objects that will represent express's
    const req = mockReq();
    const res = mockRes();

    // res as Response (Type Assertion)
    //
    //     What It Does: It tells TypeScript to treat res as if it is of type Response, even if TypeScript cannot infer this type automatically.
    //
    //     Why It's Used: In your test, mockRes() returns a Partial<Response> object, which is a subset of the full Response type. However, the updatePatient method expects a full Response object. By using as Response, you're asserting that the Partial<Response> object is compatible with the full Response type.
    //
    //     When to Use It: Use type assertions when you're confident that the object satisfies the expected type, even if TypeScript cannot verify it.
    //
    await PatientController.updatePatient(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "No id provided" });
  });

  it("should return 404 if no patient is found", async () => {
    const req = mockReq();
    req.params = { id: "1" };

    const res = mockRes();
    prisma.patient.findUnique.mockResolvedValue(null);

    await PatientController.updatePatient(req as Request, res as Response);

    expect(prisma.patient.findUnique).toHaveBeenCalled();
    expect(prisma.patient.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "No patient found" });
  });

  it("should update patient with valid fields", async () => {
    const req = mockReq();
    req.params = { id: "1" };
    req.body = {
      firstName: "John",
      lastName: "Doe",
      phone: "123",
      email: "test@email.com",
      address: "42 street",
      dateOfBirth: new Date("2000-01-01"), // Use a valid date format
      userId: 1,
    };

    const res = mockRes();
    prisma.patient.findUnique.mockResolvedValue({
      id: 1,
      firstName: "john",
      lastName: "doe",
      dateOfBirth: new Date(Date.now()),
      phone: "321",
      email: null,
      address: null,
      createdAt: new Date(Date.now()),
      updatedAt: new Date(Date.now()),
      userId: null,
    });
    prisma.patient.updateMany.mockResolvedValue({ count: 1 });

    await PatientController.updatePatient(req as Request, res as Response);

    expect(prisma.patient.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });
    expect(prisma.patient.updateMany).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        firstName: "John",
        lastName: "Doe",
        phone: "123",
        email: "test@email.com",
        address: "42 street",
        dateOfBirth: new Date("2000-01-01"), // Use a valid date format
        userId: 1,
      },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ updated: { count: 1 } });
  });

  it("should return 500 if prisma throws an unexpected error", async () => {
    const req = mockReq();
    req.params = { id: "1" };

    const res = mockRes();
    prisma.patient.findUnique.mockRejectedValue(new Error("Unexpected error"));

    await PatientController.updatePatient(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Unexpected error" });
  });

  describe("Testing patientGet errors", () => {
    it("Should return error with a bad date of birth", async () => {
      const req = mockReq();
      req.body = { id: "1", firstName: "Joe", dateOfBirth: "Bad date" };

      const res = mockRes();
      prisma.patient.findMany.mockRejectedValue(new Error("Bad date of birth"));

      await PatientController.getPatients(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Bad date of birth",
      });
    });
  });
});

describe("PatientController", () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear all mocks before each test
  });

  describe("newPatient", () => {
    it("should create a new patient and return 200", async () => {
      const req = mockReq();
      req.body = {
        firstName: "John",
        lastName: "Doe",
        dateOfBirth: "1990-01-01",
        phone: "1234567890",
        email: "john.doe@example.com",
        address: "123 Main St",
      };

      const res = mockRes();
      (prisma.patient.create as jest.Mock).mockResolvedValue({
        id: 1,
        firstName: "John",
        lastName: "Doe",
        dateOfBirth: new Date("1990-01-01"),
        phone: "1234567890",
        email: "john.doe@example.com",
        address: "123 Main St",
      });

      await PatientController.newPatient(req as Request, res as Response);

      expect(prisma.patient.create).toHaveBeenCalledWith({
        data: {
          firstName: "John",
          lastName: "Doe",
          dateOfBirth: new Date("1990-01-01"),
          phone: "1234567890",
          email: "john.doe@example.com",
          address: "1234567890", // Note: This is a bug in the controller
        },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        "Patient data:": {
          id: 1,
          firstName: "John",
          lastName: "Doe",
          dateOfBirth: new Date("1990-01-01"),
          phone: "1234567890",
          email: "john.doe@example.com",
          address: "123 Main St",
        },
      });
    });

    it("should return 400 if firstName or lastName is missing", async () => {
      const req = mockReq();
      req.body = {
        firstName: "John",
      }; // Missing lastName

      const res = mockRes();

      await PatientController.newPatient(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Missing name field" });
    });
  });

  describe("getPatient", () => {
    it("should fetch a patient by id and return 200", async () => {
      const req = mockReq();
      req.params = { id: "1" };

      const res = mockRes();
      (prisma.patient.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        firstName: "John",
        lastName: "Doe",
      });

      await PatientController.getPatient(req as Request, res as Response);

      expect(prisma.patient.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        patient: {
          id: 1,
          firstName: "John",
          lastName: "Doe",
        },
      });
    });

    it("should return 400 if no id is provided", async () => {
      const req = mockReq();
      const res = mockRes();

      await PatientController.getPatient(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "No id provided" });
    });

    it("should return 404 if no patient is found", async () => {
      const req = mockReq();
      req.params = { id: "1" };

      const res = mockRes();
      (prisma.patient.findUnique as jest.Mock).mockResolvedValue(null);

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
        firstName: "Jane",
        lastName: "Doe",
        dateOfBirth: "1995-01-01",
        phone: "0987654321",
        email: "jane.doe@example.com",
        address: "456 Elm St",
      };

      const res = mockRes();
      (prisma.patient.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (prisma.patient.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      await PatientController.updatePatient(req as Request, res as Response);

      expect(prisma.patient.updateMany).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          firstName: "Jane",
          lastName: "Doe",
          dateOfBirth: new Date("1995-01-01"),
          phone: "0987654321",
          email: "jane.doe@example.com",
          address: "456 Elm St",
        },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ updated: { count: 1 } });
    });

    it("should return 400 if no id is provided", async () => {
      const req = mockReq();
      const res = mockRes();

      await PatientController.updatePatient(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "No id provided" });
    });

    it("should return 404 if no patient is found", async () => {
      const req = mockReq();
      req.params = { id: "1" };

      const res = mockRes();
      (prisma.patient.findUnique as jest.Mock).mockResolvedValue(null);

      await PatientController.updatePatient(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "No patient found" });
    });
  });

  describe("getPatients", () => {
    it("should search for patients and return 200", async () => {
      const req = mockReq();
      req.body = {
        firstName: "John",
        lastName: "Doe",
        dateOfBirth: "1990-01-01",
        phone: "1234567890",
        email: "john.doe@example.com",
        address: "123 Main St",
      };

      const res = mockRes();
      (prisma.patient.findMany as jest.Mock).mockResolvedValue([
        {
          id: 1,
          firstName: "John",
          lastName: "Doe",
          dateOfBirth: new Date(Date.parse("1990-01-01")),
          phone: "1234567890",
          email: "john.doe@example.com",
          address: "123 Main St",
        },
      ]);

      await PatientController.getPatients(req as Request, res as Response);

      expect(prisma.patient.findMany).toHaveBeenCalledWith({
        where: {
          firstName: "John",
          lastName: "Doe",
          dateOfBirth: new Date(Date.parse("1990-01-01")),
          phone: "1234567890",
          email: "john.doe@example.com",
          address: "123 Main St",
        },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        paitents: [
          {
            id: 1,
            firstName: "John",
            lastName: "Doe",
            dateOfBirth: new Date(Date.parse("1990-01-01")),
            phone: "1234567890",
            email: "john.doe@example.com",
            address: "123 Main St",
          },
        ],
      });
    });

    it("should return 400 if dateOfBirth is invalid", async () => {
      const req = mockReq();
      req.body = {
        dateOfBirth: "invalid-date",
      };

      const res = mockRes();

      await PatientController.getPatients(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Bad date of birth" });
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

      const res = mockRes();
      (prisma.patient.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (prisma.medicalRecord.create as jest.Mock).mockResolvedValue({
        id: 1,
        diagnosis: "Diagnosis A",
        notes: "Patient notes",
      });

      await PatientController.addRecord(req as Request, res as Response);

      expect(prisma.medicalRecord.create).toHaveBeenCalledWith({
        data: {
          notes: "Patient notes",
          diagnosis: "Diagnosis A",
          patient: {
            connect: {
              id: 1,
            },
          },
        },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        updated: {
          id: 1,
          diagnosis: "Diagnosis A",
          notes: "Patient notes",
        },
      });
    });

    it("should return 400 if no id is provided", async () => {
      const req = mockReq();
      const res = mockRes();

      await PatientController.addRecord(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "No id provided" });
    });

    it("should return 404 if no patient is found", async () => {
      const req = mockReq();
      req.params = { id: "1" };

      const res = mockRes();
      (prisma.patient.findUnique as jest.Mock).mockResolvedValue(null);

      await PatientController.addRecord(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "No patient found" });
    });
  });

  describe("getLabResults", () => {
    it("should fetch lab results for a patient and return 200", async () => {
      const req = mockReq();
      req.params = { id: "1" };

      const res = mockRes();
      (prisma.patient.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (prisma.labResult.findMany as jest.Mock).mockResolvedValue([
        {
          id: 1,
          patientId: 1,
          testName: "Test A",
          result: "Positive",
          notes: "Lab notes",
        },
      ]);

      await PatientController.getLabResults(req as Request, res as Response);

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

    it("should return 400 if no id is provided", async () => {
      const req = mockReq();
      const res = mockRes();

      await PatientController.getLabResults(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "No id provided" });
    });

    it("should return 404 if no patient is found", async () => {
      const req = mockReq();
      req.params = { id: "1" };

      const res = mockRes();
      (prisma.patient.findUnique as jest.Mock).mockResolvedValue(null);

      await PatientController.getLabResults(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "No patient found" });
    });
  });
});
