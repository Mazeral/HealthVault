import { Request, Response } from "express";
import prisma from "../utils/prisma";
import createObject from "../utils/utilFunctions";
import { CustomSessionData } from "../types";

class MedRecordController {
  // Add a medical record for a patient
  static async addRecord(req: Request, res: Response) {
    try {
      const patientFullName = req.body.patientFullName
      const diagnosis = req.body.diagnosis;
      const notes = req.body.notes;

      if (!patientFullName || !diagnosis || diagnosis === "")
        throw Error("Missing fields");

      // Get the user ID from the session
      const session = req.session as CustomSessionData;
      const userId = Number(session.user?.id);

      if (!userId || userId === undefined) {
        throw new Error("Unauthorized: No user ID found in session");
      }
	const patient = await prisma.patient.findUnique({
				where:{
					fullName: patientFullName
				}
			})
	
	if (patient)
      if (userId !== undefined) {
        const medRecord = await prisma.medicalRecord.create({
          data: {
            patientId: Number(patient.id),
            diagnosis: diagnosis,
            notes: notes,
            userId: userId,
          },
        });
		res.status(200).json({medRecord})
      }
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
    const medicalRecordId = Number(req.params.id);
    if (!medicalRecordId) throw new Error("No medical record ID provided");

    // Validate required fields
    const { diagnosis, notes, patientId, patientFullName } = req.body;
    if (!diagnosis && !notes && !patientId && !patientFullName) {
      throw new Error("No fields provided for update");
    }

    // If patientFullName is provided, validate it
    if (patientFullName && typeof patientFullName !== "string") {
      throw new Error("Invalid patient full name provided");
    }

    // If patientId is provided, validate it
    if (patientId && isNaN(Number(patientId))) {
      throw new Error("Invalid patient ID provided");
    }

    let updatedPatientId = patientId ? Number(patientId) : undefined; // Default to the provided patientId

    // If patientFullName is provided, find the patient
    if (patientFullName) {
      const patient = await prisma.patient.findFirst({
        where: { fullName: patientFullName },
      });

      if (!patient) {
        throw new Error(`No patient found with the name: ${patientFullName}`);
      }

      updatedPatientId = patient.id; // Use the found patient's ID
    }

    // Create an object with only the provided fields for the MedicalRecord
    const medicalRecordData = createObject({
      diagnosis,
      notes,
      patientId: updatedPatientId, // Use the updated patientId
    });

    // Update the medical record and include the patient relationship
    const updatedRecord = await prisma.medicalRecord.update({
      where: { id: medicalRecordId },
      data: medicalRecordData,
      include: { patient: true }, // Include the patient relationship
    });

    res.status(200).json({ updated: updatedRecord });
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message === "No medical record ID provided" ||
        error.message === "No fields provided for update" ||
        error.message === "Invalid patient full name provided" ||
        error.message === "Invalid patient ID provided" ||
        error.message.startsWith("No patient found with the name:")
      ) {
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
        include: {
          User: true, // Include the user who created the medical record
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
          User: true, // Include the user who created the medical record
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
