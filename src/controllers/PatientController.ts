import { Request, Response } from "express";
import prisma from "../utils/prisma";
import createObject from "../utils/utilFunctions";

class PatientController {
  // Creates a patient without health records
  static async newPatient(req: Request, res: Response) {
    const fullName = req.body.fullName || null;
    const dateOfBirth = new Date(req.body.dateOfBirth) || null;
    const phone = String(req.body.phone) || null;
    const email = String(req.body.email) || null;
    const address = String(req.body.address) || null;

    try {
      if (!fullName || fullName.trim() === "") {
        throw new Error("Full name is required");
      }

      const result = await prisma.patient.create({
        data: {
          fullName: fullName,
          dateOfBirth: dateOfBirth,
          phone: phone,
          email: email,
          address: address,
        },
      });

      res.status(200).json({ "Patient data:": result });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Full name is required") {
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
        dateOfBirth: new Date(Date.parse(req.body.dateOfBirth)),
        phone: String(req.body.phone),
        email: String(req.body.email),
        address: String(req.body.address),
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
        dateOfBirth: new Date(Date.parse(String(req.body.dateOfBirth))),
        phone: req.body.phone,
        email: req.body.email,
        address: req.body.address,
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
}

export default PatientController;
