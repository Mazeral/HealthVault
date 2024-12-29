import { Request, Response } from "express";
import prisma from "../utils/prisma";
import createObject from "../utils/utilFunctions";

class MedRecordController {
  // Add a medical record for a patient
  static async addRecord(req: Request, res: Response) {
    try {
      const patientId = req.body.patientId || null;
      const diagnosis = req.body.diganosis || null;
      const notes = req.body.notes || null;

      if (!patientId || !diagnosis || !notes) throw Error("Missing fields");
      const medRecord = await prisma.medicalRecord.create({
        data: {
          patientId: patientId,
          diagnosis: diagnosis,
          notes: notes,
          patient: {
            connect: {
              id: patientId,
            },
          },
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
    // Updates a medical record
    try {
      const patientId = Number(req.params.id) || null;

      if (!patientId) throw Error("No id provided");

      const patient = await prisma.patient.findUnique({
        where: {
          id: patientId,
        },
      });
      if (!patient) throw Error("No patient found");

      // Creates an object with key names and values
      const data = createObject({
        diagnosis: req.body.diagnosis,
        notes: req.body.notes,
        patientId: req.body.patientId,
      });

      const updates = await prisma.medicalRecord.updateMany({
        where: {
          id: patientId,
        },
        data: data,
      });
      if (data.patientId) {
        await prisma.medicalRecord.update({
          where: {
            id: Number(data.patientId),
          },
          // Links the id of the record to the id of the patientId
          data: {
            patient: {
              connect: {
                id: Number(data.patientId),
              },
            },
          },
        });
      }
      res.status(200).json({ updated: updates });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "No id provided")
          res.status(400).json({ error: error.message });
        else if (error.message === "No patient found")
          res.status(404).json({ error: error.message });
        else res.status(500).json({ error: error.message });
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
}

export default MedRecordController;
