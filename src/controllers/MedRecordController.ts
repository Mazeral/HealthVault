import { Request, Response } from "express";
import prisma from "../utils/prisma";
import createObject from "../utils/utilFunctions";
import { CustomSessionData } from "../types";

class MedRecordController {
  // Add a medical record for a patient
  static async addRecord(req: Request, res: Response) {
    try {
      const patientId = Number(req.body.patientId) || null;
      const diagnosis = req.body.diagnosis;
      const notes = req.body.notes;

      if (!patientId || !diagnosis || diagnosis === "")
        throw Error("Missing fields");
      const medRecord = await prisma.medicalRecord.create({
        data: {
          patientId: patientId,
          diagnosis: diagnosis,
          notes: notes,
        },
      });
      res.status(200).json({ success: medRecord });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Missing fields")
          res.status(400).json({ error: error.message });
        else res.status(500).json({ error: error.message });
      }
    }
  }

  static async updateMedRecord(req: Request, res: Response) {
    try {
      const medicalRecordId = Number(req.params.id); // Corrected: Use medicalRecordId, not patientId
      if (!medicalRecordId) throw new Error("No medical record ID provided");

      // Validate required fields
      const { diagnosis, notes, patientId } = req.body;
      if (!diagnosis && !notes && !patientId) {
        throw new Error("No fields provided for update");
      }

      // Create an object with only the provided fields
      const data = createObject({
        diagnosis,
        notes,
        patientId,
      });

      // Update the medical record
      const updatedRecord = await prisma.medicalRecord.update({
        where: {
          id: medicalRecordId, // Use the medical record ID
        },
        data,
      });

      res.status(200).json({ updated: updatedRecord });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "No medical record ID provided") {
          res.status(400).json({ error: error.message });
        } else if (error.message === "No fields provided for update") {
          res.status(400).json({ error: error.message });
        } else {
          res.status(500).json({ error: error.message });
        }
      }
    }
  }

  // Fetch a medical record of a patient from the database
  static async getMedRecord(req: Request, res: Response) {
    try {
      const id: number | null = Number(req.params.id) || null;

      if (!id) throw Error("No id provided");

      const medRecord = await prisma.medicalRecord.findUnique({
        where: {
          id: id,
        },
      });
      if (!medRecord) throw Error("Medical record not found");
      else res.status(200).json({ "Medical Record": medRecord });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "No id provided")
          res.status(400).json({ error: error.message });
        else if (error.message === "Medical record not found")
          res.status(404).json({ error: error.message });
        else res.status(500).json({ error: error.message });
      }
    }
  }

  // Delete a medical record from the database
  static async deleteRecord(req: Request, res: Response) {
    try {
      const id = Number(req.params.id) || null;

      if (!id) throw Error("No id provided");
      const deleteRecord = await prisma.medicalRecord.delete({
        where: {
          id: id,
        },
      });
      res.status(200).json({ message: deleteRecord });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "No id provided")
          res.status(400).json({ error: error.message });
        else res.status(500).json({ error: error.message });
      }
    }
  }

  static async getLabResults(req: Request, res: Response) {
    // Get lab results depending on the req

    const data = createObject({
      patientId: Number(req.body.patientId),
      testName: String(req.body.testName),
      result: String(req.body.result),
      notes: String(req.body.notes),
    });

    const labResults = await prisma.labResult
      .findMany({
        where: data,
      })
      .catch((error) => {
        if (error instanceof Error)
          res.status(500).json({ error: error.message });
      });
    res.status(200).json({ "Lab Results": labResults });
  }

  static async allLabResults(req: Request, res: Response) {
    const data = await prisma.labResult.findMany().catch((error) => {
      if (error instanceof Error)
        res.status(500).json({ error: error.message });
    });
    res.status(200).json({ "Lab Results": data });
  }

  static async allMedicalRecords(req: Request, res: Response) {
    try {
      const records = await prisma.medicalRecord.findMany({
        include: {
          patient: {
            select: {
              fullName: true, // Include the patient's full name
            },
          },
        },
      });
      res.status(200).json({ "Medical Records": records });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      }
    }
  }
  // Fetch medical records for the authenticated user (doctor or patient)
  static async getMyMedicalRecords(req: Request, res: Response) {
    try {
      const session = req.session as CustomSessionData; // Cast session to CustomSessionData
      const userId = Number(session.user?.id); // Get the user ID from the session

      if (!userId) {
        throw new Error("Unauthorized: No user ID found in session");
      }

      // Fetch medical records for the user
      const medicalRecords = await prisma.medicalRecord.findMany({
        where: {
          patient: {
            userId: Number(userId), // Filter by the user's ID
          },
        },
        include: {
          patient: true, // Include patient details if needed
        },
      });

      res.status(200).json({ medicalRecords });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Unauthorized: No user ID found in session") {
          res.status(401).json({ error: error.message });
        } else {
          res.status(500).json({ error: error.message });
        }
      }
    }
  }
}

export default MedRecordController;
