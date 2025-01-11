import { Request, Response } from "express";
import prisma from "../utils/prisma";
import createObject from "../utils/utilFunctions";

class PatientController {
  // Creates a patient without health records
  static async newPatient(req: Request, res: Response) {
    const fullName = req.body.fullName || null;
    const dateOfBirth = req.body.dateOfBirth ? new Date(req.body.dateOfBirth) : null;
    const phone = String(req.body.phone) || null;
    const email = String(req.body.email) || null;
    const address = String(req.body.address) || null;
    const sex = req.body.sex || null; // Add sex field

    try {
      if (!fullName || fullName.trim() === "") {
        throw new Error("Full name is required");
      }

      if (!sex) {
        throw new Error("Sex is required");
      }

      const result = await prisma.patient.create({
        data: {
          fullName: fullName,
          dateOfBirth: dateOfBirth,
          phone: phone,
          email: email,
          address: address,
          sex: sex, // Include sex
        },
      });

      res.status(200).json({ "Patient data:": result });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Full name is required" || error.message === "Sex and age are required") {
          res.status(400).json({ error: error.message });
        } else {
          res.status(500).json({ error: error.message });
        }
      }
    }
  }

  // Gets a patient by ID
  static async getPatient(req: Request, res: Response) {
    const id = req.params.id ? Number(req.params.id) : null;

    try {
      if (!id) throw new Error("No ID provided");

      const patient = await prisma.patient.findUnique({
        where: {
          id: id,
        },
      });

      if (!patient) throw new Error("No patient found");

      res.status(200).json({ patient: patient });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "No ID provided") {
          res.status(400).json({ error: error.message });
        } else if (error.message === "No patient found") {
          res.status(404).json({ error: error.message });
        } else {
          res.status(500).json({ error: error.message });
        }
      }
    }
  }

  // Updates a patient by ID
  static async updatePatient(req: Request, res: Response) {
    const id = Number(req.params.id) || null;

    try {
      if (!id) throw new Error("No ID provided");

      const patient = await prisma.patient.findUnique({
        where: {
          id: id,
        },
      });

      if (!patient) throw new Error("No patient found");

      const data = createObject({
        fullName: String(req.body.fullName),
        dateOfBirth: req.body.dateOfBirth ? new Date(req.body.dateOfBirth) : undefined,
        phone: String(req.body.phone),
        email: String(req.body.email),
        address: String(req.body.address),
        sex: String(req.body.sex), // Include sex
        userId: Number(req.body.userId),
      });

      const result = await prisma.patient.update({
        where: {
          id: id,
        },
        data: data,
      });

      res.status(200).json({ updated: result });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "No ID provided") {
          res.status(400).json({ error: error.message });
        } else if (error.message === "No patient found") {
          res.status(404).json({ error: error.message });
        } else {
          res.status(500).json({ error: error.message });
        }
      }
    }
  }

  // Gets all patients
  static async getPatients(req: Request, res: Response) {
    try {
      const data = await prisma.patient.findMany();
      res.status(200).json({ data: data });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      }
    }
  }

  // Searches for patients based on criteria
  static async searchPatients(req: Request, res: Response) {
    try {
      const data = createObject({
        fullName: req.body.fullName,
        dateOfBirth: req.body.dateOfBirth ? new Date(req.body.dateOfBirth) : undefined,
        phone: req.body.phone,
        email: req.body.email,
        address: req.body.address,
        sex: req.body.sex, // Include sex
      });

      // Check if dateOfBirth is a valid date
      if (data.dateOfBirth && isNaN(data.dateOfBirth.getTime())) {
        throw new Error("Invalid date of birth");
      }

      const patients = await prisma.patient.findMany({
        where: {
          fullName: data.fullName,
          dateOfBirth: data.dateOfBirth,
          phone: data.phone,
          email: data.email,
          address: data.address,
          sex: data.sex,
        },
      });

      res.status(200).json({ patients: patients });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Invalid date of birth") {
          res.status(400).json({ error: error.message });
        } else {
          res.status(500).json({ error: error.message });
        }
      }
    }
  }

  // Adds a medical record for a patient
  static async addRecord(req: Request, res: Response) {
    try {
      const patientId = Number(req.params.id) || null;
      const diagnosis = String(req.body.diagnosis);
      const notes = String(req.body.notes) || null;

      if (!patientId) throw new Error("No ID provided");

      const patient = await prisma.patient.findUnique({
        where: {
          id: patientId,
        },
      });

      if (!patient) throw new Error("No patient found");

      const record = await prisma.medicalRecord.create({
        data: {
          notes: notes,
          diagnosis: diagnosis,
          patient: {
            connect: {
              id: patientId,
            },
          },
        },
      });

      res.status(200).json({ updated: record });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "No ID provided") {
          res.status(400).json({ error: error.message });
        } else if (error.message === "No patient found") {
          res.status(404).json({ error: error.message });
        } else {
          res.status(500).json({ error: error.message });
        }
      }
    }
  }

  // Gets lab results for a patient
  static async getLabResults(req: Request, res: Response) {
    try {
      const patientId = req.params.id || null;

      if (!patientId) throw new Error("No ID provided");

      const patient = await prisma.patient.findUnique({
        where: {
          id: Number(patientId),
        },
      });

      if (!patient) throw new Error("No patient found");

      const labResults = await prisma.labResult.findMany({
        where: {
          patientId: Number(patientId),
        },
      });

      res.status(200).json({ "Lab Results": labResults });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "No ID provided") {
          res.status(400).json({ error: error.message });
        } else if (error.message === "No patient found") {
          res.status(404).json({ error: error.message });
        } else {
          res.status(500).json({ error: error.message });
        }
      }
    }
  }

  // Deletes a patient by ID
  static async deletePatient(req: Request, res: Response) {
    const id = Number(req.params.id) || null;

    try {
      if (!id) throw new Error("No ID provided");

      const patient = await prisma.patient.findUnique({
        where: {
          id: id,
        },
      });

      if (!patient) throw new Error("No patient found");

      await prisma.patient.delete({
        where: {
          id: id,
        },
      });

      res.status(200).json({ message: "Patient deleted successfully" });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "No ID provided") {
          res.status(400).json({ error: error.message });
        } else if (error.message === "No patient found") {
          res.status(404).json({ error: error.message });
        } else {
          res.status(500).json({ error: error.message });
        }
      }
    }
  }

  // Gets statistics for patients
  static async getStatistics(req: Request, res: Response) {
    try {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      const todayCount = await prisma.patient.count({
        where: {
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      const monthlyCount = await prisma.patient.count({
        where: {
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      });

      const startOfYear = new Date(today.getFullYear(), 0, 1);
      const endOfYear = new Date(today.getFullYear(), 11, 31);

      const yearlyCount = await prisma.patient.count({
        where: {
          createdAt: {
            gte: startOfYear,
            lte: endOfYear,
          },
        },
      });

      res.status(200).json({
        today: todayCount,
        monthly: monthlyCount,
        yearly: yearlyCount,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      }
    }
  }
}

export default PatientController;
