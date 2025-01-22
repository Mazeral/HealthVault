import { Request, Response } from "express";
import prisma from "../utils/prisma";
import createObject from "../utils/utilFunctions";
import { CustomSessionData } from "../types";

class PatientController {
  // Creates a patient without health records
  static async newPatient(req: Request, res: Response) {
    const fullName = req.body.fullName || null;
    const dateOfBirth = req.body.dateOfBirth
      ? new Date(req.body.dateOfBirth)
      : null;
    const phone = String(req.body.phone) || null;
    const email = String(req.body.email) || null;
    const address = String(req.body.address) || null;
    const sex = req.body.sex || null; // Add sex field
    const bloodGroup = req.body.bloodGroup || null;
    const session = req.session as CustomSessionData;
    const userId = Number(session.user?.id);

    try {
      // Check for missing fullName first
      if (!fullName || fullName.trim() === "") {
        throw new Error("Full name is required");
      }

      // Check for missing sex
      if (!sex) {
        throw new Error("Sex is required");
      }

      // Check for authentication
      if (!userId) {
        throw new Error("Not authenticated");
      }

      // Create the patient
      const result = await prisma.patient.create({
        data: {
          fullName: fullName,
          dateOfBirth: dateOfBirth,
          phone: phone,
          email: email,
          address: address,
          sex: sex, // Include sex
          bloodGroup: bloodGroup,
          userId: userId,
        },
      });

      res.status(200).json({ "Patient data:": result });
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message === "Full name is required" ||
          error.message === "Sex is required"
        ) {
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
      if (!id) throw new Error("No ID provided from getPatient");

      const patient = await prisma.patient.findUnique({
        where: {
          id: id,
        },
        include: {
          User: true, // Include the User relation
        },
      });

      if (!patient) throw new Error("No patient found");

      // Add the creator's name to the response
      const response = {
        ...patient,
        createdBy: patient.User?.name || "Unknown",
      };

      res.status(200).json({ patient: response });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "No ID provided from getPatient") {
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
      if (!id) throw new Error("No ID provided from updatePatient");

      const patient = await prisma.patient.findUnique({
        where: {
          id: id,
        },
        include: {
          User: true, // Include the User relation
        },
      });

      if (!patient) throw new Error("No patient found");

      const data = createObject({
        fullName: String(req.body.fullName),
        dateOfBirth: req.body.dateOfBirth
          ? new Date(req.body.dateOfBirth)
          : undefined,
        phone: String(req.body.phone),
        email: String(req.body.email),
        address: String(req.body.address),
        sex: String(req.body.sex), // Include sex
        bloodGroup: String(req.body.bloodGroup),
        userId: Number(req.body.userId),
      });

      const updatedPatient = await prisma.patient.update({
        where: {
          id: id,
        },
        data: data,
        include: {
          User: true, // Include the User relation
        },
      });

      // Add the createdBy field to the response
      const response = {
        ...updatedPatient,
        createdBy: updatedPatient.User?.name || "Unknown",
      };

      res.status(200).json({ updated: response });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "No ID provided from updatePatient") {
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
      const patients = await prisma.patient.findMany({
        include: {
          User: true, // Include the User relation
        },
      });

      // Add the creator's name to each patient
      const response = patients.map((patient) => ({
        ...patient,
        createdBy: patient.User?.name || "Unknown",
      }));

      res.status(200).json({ data: response });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      }
    }
  }

  // Searches for patients based on criteria
  static async searchPatients(req: Request, res: Response): Promise<void> {
    let { name } = req.query;
    name = String(name);
    try {
      const patients = await prisma.patient.findMany({
        where: {
          fullName: {
            contains: name,
          },
        },
        include: {
          User: true, // Include the User relation
        },
      });

      // Add the creator's name to each patient
      const response = patients.map((patient) => ({
        ...patient,
        createdBy: patient.User?.name || "Unknown",
      }));

      res.json({ patients: response });
    } catch (error) {
      res.status(500).json({ error: "Failed to search patients" });
    }
  }

  // Adds a medical record for a patient
  static async addRecord(req: Request, res: Response) {
    try {
      const patientId = Number(req.params.id) || null;
      const diagnosis = String(req.body.diagnosis);
      const notes = String(req.body.notes) || null;
      const session = req.session as CustomSessionData;
      const userId = Number(session.user?.id);

      if (!userId) {
        throw new Error("Not authenticated");
      }

      if (!patientId) {
        throw new Error("No ID provided from addRecord");
      }

      const patient = await prisma.patient.findUnique({
        where: {
          id: patientId,
        },
      });

      if (!patient) {
        throw new Error("No patient found");
      }

      const record = await prisma.medicalRecord.create({
        data: {
          notes: notes,
          diagnosis: diagnosis,
          userId: userId,
          patientId: patientId,
        },
      });

      res.status(200).json({ updated: record });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "No ID provided from addRecord") {
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

      if (!patientId) throw new Error("No ID provided from getLabResults");

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
        if (error.message === "No ID provided from getLabResults") {
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
      if (!id) throw new Error("No ID provided from deletePatient");

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
        if (error.message === "No ID provided from deletePatient") {
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
      const today = new Date(); // Current date and time

      // Calculate today's count (UTC)
      const startOfDay = new Date(
        Date.UTC(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          0,
          0,
          0,
          0,
        ),
      );
      const endOfDay = new Date(
        Date.UTC(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          23,
          59,
          59,
          999,
        ),
      );

      const todayCount = await prisma.patient.count({
        where: {
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      // Calculate monthly count (UTC)
      const startOfMonth = new Date(
        Date.UTC(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0),
      );
      const endOfMonth = new Date(
        Date.UTC(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999),
      );

      const monthlyCount = await prisma.patient.count({
        where: {
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      });

      // Calculate yearly count (UTC)
      const startOfYear = new Date(
        Date.UTC(today.getFullYear(), 0, 1, 0, 0, 0, 0),
      );
      const endOfYear = new Date(
        Date.UTC(today.getFullYear(), 11, 31, 23, 59, 59, 999),
      );

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
      console.error("Error in getStatistics:", error); // Log the error for debugging
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: "An unknown error occurred" });
      }
    }
  }
}

export default PatientController;
