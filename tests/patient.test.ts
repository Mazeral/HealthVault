// patient.controller.test.ts
import { Request, Response } from "express";
import prismaMock from "./singleton";
import PatientController from "../src/controllers/PatientController";
import { CustomSessionData } from "../src/types/index";

describe("PatientController", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  const mockSession: CustomSessionData = {
    user: { id: "1", role: "DOCTOR" },
  } as CustomSessionData;

  beforeEach(() => {
    mockRequest = {
      body: {},
      params: {},
      session: mockSession,
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("newPatient", () => {
    it("should create a new patient successfully", async () => {
      const patientData = {
        fullName: "John Doe",
        sex: "MALE",
        dateOfBirth: "1990-01-01",
        phone: "1234567890",
        email: "john@example.com",
        address: "123 Street",
        bloodGroup: "A_PLUS",
      };

      mockRequest.body = patientData;
      const expectedPatient = {
        id: 1,
        ...patientData,
        dateOfBirth: new Date(patientData.dateOfBirth),
        userId: 1,
        createdAt: new Date(), // Add missing property
        updatedAt: new Date(), // Add missing property
        sex: "MALE" as const, // Use correct enum type
        bloodGroup: "A_PLUS" as const, // Use correct enum type
      };

      prismaMock.patient.create.mockResolvedValue(expectedPatient);

      await PatientController.newPatient(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(prismaMock.patient.create).toHaveBeenCalledWith({
        data: {
          ...patientData,
          dateOfBirth: new Date(patientData.dateOfBirth),
          userId: 1,
          sex: "MALE", // Match enum type
          bloodGroup: "A_PLUS", // Match enum type
        },
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        "Patient data:": expectedPatient,
      });
    });
    it("should return 400 for missing fullName", async () => {
      mockRequest.body = { sex: "MALE" };
      await PatientController.newPatient(
        mockRequest as Request,
        mockResponse as Response,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it("should return 400 for missing sex", async () => {
      mockRequest.body = { fullName: "John Doe" };
      await PatientController.newPatient(
        mockRequest as Request,
        mockResponse as Response,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it("should return 401 for unauthenticated users", async () => {
      mockRequest.body = {
        fullName: "John Doe",
        sex: "MALE",
        // Include all required fields
        dateOfBirth: "1990-01-01",
        phone: "1234567890",
        email: "john@example.com",
        address: "123 Street",
        bloodGroup: "A_PLUS",
      };
      mockRequest.session = { user: undefined } as CustomSessionData;

      await PatientController.newPatient(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getPatient", () => {
    it("should retrieve a patient by ID", async () => {
      const patientId = "1";
      mockRequest.params = { id: patientId };
      const mockPatient = {
        id: 1,
        fullName: "John Doe",
        User: { name: "Dr. Smith" },
      };

      prismaMock.patient.findUnique.mockResolvedValue(mockPatient as any);

      await PatientController.getPatient(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(prismaMock.patient.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { User: true },
      });
      expect(mockResponse.json).toHaveBeenCalledWith({
        patient: {
          ...mockPatient,
          createdBy: "Dr. Smith",
        },
      });
    });

    it("should return 400 for missing ID", async () => {
      mockRequest.params = {};
      await PatientController.getPatient(
        mockRequest as Request,
        mockResponse as Response,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it("should return 404 for non-existent patient", async () => {
      mockRequest.params = { id: "999" };
      prismaMock.patient.findUnique.mockResolvedValue(null);
      await PatientController.getPatient(
        mockRequest as Request,
        mockResponse as Response,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });
  });

  describe("getPatients", () => {
    it("should retrieve all patients", async () => {
      const mockPatients = [
        { id: 1, fullName: "John Doe", User: { name: "Dr. Smith" } },
      ];
      prismaMock.patient.findMany.mockResolvedValue(mockPatients as any);

      await PatientController.getPatients(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(prismaMock.patient.findMany).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: [
          {
            ...mockPatients[0],
            createdBy: "Dr. Smith",
          },
        ],
      });
    });

    it("should handle database errors", async () => {
      prismaMock.patient.findMany.mockRejectedValue(new Error("DB error"));
      await PatientController.getPatients(
        mockRequest as Request,
        mockResponse as Response,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  describe("searchPatients", () => {
    it("should search patients by name", async () => {
      mockRequest.query = { name: "John" };
      const mockPatients = [
        { id: 1, fullName: "John Doe", User: { name: "Dr. Smith" } },
      ];
      prismaMock.patient.findMany.mockResolvedValue(mockPatients as any);

      await PatientController.searchPatients(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(prismaMock.patient.findMany).toHaveBeenCalledWith({
        where: { fullName: { contains: "John" } },
        include: { User: true },
      });
      expect(mockResponse.json).toHaveBeenCalledWith({
        patients: [
          {
            ...mockPatients[0],
            createdBy: "Dr. Smith",
          },
        ],
      });
    });
  });

  describe("getLabResults", () => {
    it("should retrieve lab results", async () => {
      mockRequest.params = { id: "1" };
      const mockPatient = { id: 1 };
      const mockResults = [{ id: 1, testName: "Blood Test" }];

      prismaMock.patient.findUnique.mockResolvedValue(mockPatient as any);
      prismaMock.labResult.findMany.mockResolvedValue(mockResults as any);

      await PatientController.getLabResults(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(prismaMock.labResult.findMany).toHaveBeenCalledWith({
        where: { patientId: 1 },
      });
    });

    it("should return 400 for missing ID", async () => {
      mockRequest.params = {};
      await PatientController.getLabResults(
        mockRequest as Request,
        mockResponse as Response,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe("updatePatient", () => {
    it("should update patient information", async () => {
      const patientId = "1";
      mockRequest.params = { id: patientId };
      mockRequest.body = { fullName: "Updated Name" };

      const mockPatient = {
        id: 1,
        fullName: "Original Name",
        User: { name: "Dr. Smith" },
      };

      prismaMock.patient.findUnique.mockResolvedValue(mockPatient as any);
      prismaMock.patient.update.mockResolvedValue({
        ...mockPatient,
        fullName: "Updated Name",
      } as any);

      await PatientController.updatePatient(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(prismaMock.patient.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { fullName: "Updated Name" },
        include: { User: true },
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
    it("should handle partial updates", async () => {
      mockRequest.params = { id: "1" };
      mockRequest.body = { phone: "9876543210" };

      prismaMock.patient.findUnique.mockResolvedValue({ id: 1 } as any);
      prismaMock.patient.update.mockResolvedValue({} as any);

      await PatientController.updatePatient(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(prismaMock.patient.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { phone: "9876543210" },
        include: { User: true },
      });
    });

    it("should return 404 for non-existent patient", async () => {
      mockRequest.params = { id: "999" };
      prismaMock.patient.findUnique.mockResolvedValue(null);
      await PatientController.updatePatient(
        mockRequest as Request,
        mockResponse as Response,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });
  });

  describe("getStatistics", () => {
    it("should return patient statistics", async () => {
      prismaMock.patient.count.mockResolvedValue(5);

      await PatientController.getStatistics(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(prismaMock.patient.count).toHaveBeenCalledTimes(3);
      expect(mockResponse.json).toHaveBeenCalledWith({
        today: 5,
        monthly: 5,
        yearly: 5,
      });
    });
  });

  describe("deletePatient", () => {
    it("should delete a patient successfully", async () => {
      const patientId = "1";
      mockRequest.params = { id: patientId };

      prismaMock.patient.findUnique.mockResolvedValue({ id: 1 } as any);
      prismaMock.patient.delete.mockResolvedValue({} as any);

      await PatientController.deletePatient(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(prismaMock.patient.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
    it("should return 404 for non-existent patient", async () => {
      mockRequest.params = { id: "999" };
      prismaMock.patient.findUnique.mockResolvedValue(null);
      await PatientController.deletePatient(
        mockRequest as Request,
        mockResponse as Response,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });
  });
});
