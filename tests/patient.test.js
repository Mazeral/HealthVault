import { mockDeep, mockReset } from "jest-mock-extended";
import prisma from "../singleton"; // Mock Prisma client
import PatientController from "../controllers/PatientController";

// Mocking the req object
const mockReq = () => ({
  params: {},
  body: {},
});

// Mocking the res object
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res); // Chainable
  res.json = jest.fn().mockReturnValue(res);   // Chainable
  return res;
};

beforeEach(() => {
mockReset(prisma);
});

// Start of the test
describe("PatientController.updatePatient", () => {
	// allowedFields from the original method
  const allowedFields = [
    "firstName",
    "lastName",
    "dateOfBirth",
    "phone",
    "email",
    "address",
  ];


  it("should return 400 if no id is provided", async () => {
    const req = mockReq();
    const res = mockRes();

    await PatientController.updatePatient(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "No id provided" });
  });

  it("should return 404 if no patient is found", async () => {
    const req = mockReq();
    req.params.id = "1";

    const res = mockRes();
    prisma.patient.findUnique.mockResolvedValue(null);

    await PatientController.updatePatient(req, res);

	expect(prisma.patient.findUnique).toHaveBeenCalled()
    expect(prisma.patient.findUnique).toHaveBeenCalledWith({
      where: { id: "1" },
    });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "No patient found" });
  });

  it("should update patient with valid fields", async () => {
    const req = mockReq();
    req.params.id = "1";
    req.body = {
      firstName: "John",
      lastName: "Doe",
      phone: "1234567890",
      email: "john.doe@example.com",
    };

    const res = mockRes();
    prisma.patient.findUnique.mockResolvedValue({ id: "1" });
    prisma.patient.updateMany.mockResolvedValue({ count: 1 });

    await PatientController.updatePatient(req, res);

    expect(prisma.patient.findUnique).toHaveBeenCalledWith({
      where: { id: "1" },
    });
    expect(prisma.patient.updateMany).toHaveBeenCalledWith({
      where: { id: "1" },
      data: {
        firstName: "John",
        lastName: "Doe",
        phone: "1234567890",
        email: "john.doe@example.com",
      },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ updated: { count: 1 } });
  });

  it("should return 500 if prisma throws an unexpected error", async () => {
    const req = mockReq();
    req.params.id = "1";

    const res = mockRes();
    prisma.patient.findUnique.mockRejectedValue(new Error("Unexpected error"));

    await PatientController.updatePatient(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Unexpected error" });
  });
});
