import prisma from "../utils/prisma";
import { Request, Response } from "express";
import createObject from "../utils/utilFunctions";

class PrescriptionController {
  // Create a prescription for a patient
  static async newPrescription(req: Request, res: Response) {
    const patientId = req.body.patientId || null;
    const medication = req.body.medication || null;
    const dosage = req.body.dosage || null;
    const instructions = req.body.instructions || null;

    try {
      if (!patientId) throw Error("No patientId provided");
      if (!medication) throw Error("No medication provided");
      if (!dosage) throw Error("No dosage provided");

      const prescription = await prisma.prescription.create({
        data: {
          patientId: patientId,
          medication: medication,
          dosage: dosage,
          instructions: instructions,
          patient: {
            connect: {
              id: patientId,
            },
          },
        },
      });
      res.status(200).json({ prescription: prescription });
    } catch (error) {
      if (
        error.message === "No id provided" ||
        error.message === "No patientId provided" ||
        error.message === "No medication provided" ||
        error.message === "No dosage provided"
      )
        res.status(400).json({ error: error.message });
      else res.status(500).json({ error: error.message });
    }
  }

  // Fetch a prescription by id
  static async getPrescription(req: Request, res: Response) {
    try {
      const prescId = req.params.id;

      if (!prescId) throw Error("No prescription ID provided");

      const prescription = await prisma.prescription.findUnique({
        where: {
          id: Number(prescId),
        },
      });

      res.status(200).json({ prescription: prescription });
    } catch (error) {
      if (error.message === "No prescription ID provided")
        res.status(400).json({ error: error.message });
      else res.status(500).json({ error: error.message });
    }
  }

  // gets all the prescriptions from the database
  static async allPrescriptions(req: Request, res: Response) {
    try {
      const prescriptions = await prisma.prescription.findMany();
      res.status(200).json({ prescriptions: prescriptions });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // update a prescription
  static async updatePrescription(req: Request, res: Response) {
    try {
      const prescId = req.params.id;

      if (!prescId) throw Error("Prescription ID not provided");

      const data = createObject({
        patientId: Number(req.body.patientId),
        medication: String(req.body.medication),
        dosage: String(req.body.dosage),
        instructions: String(req.body.instructions),
      });

      const updates = await prisma.prescription.updateMany({
        where: {
          id: Number(prescId),
        },
        data: data,
      });
      if (data.patientId)
        await prisma.prescription.update({
          where: {
            id: Number(prescId),
          },
          data: {
            patient: {
              connect: {
                id: Number(data.patientId),
              },
            },
          },
        });
      res.status(200).json({ updated: updates });
    } catch (error) {
      if (error.message === "Prescription ID not provided")
        res.status(400).json({ error: error.message });
      else res.status(500).json({ error: error.message });
    }
  }

  // Delete a prescription
  static async deletePrescription(req: Request, res: Response) {
    try {
      const prescId = req.params.id || null;

      const result = await prisma.prescription.delete({
        where: {
          id: Number(prescId),
        },
      });
      res.status(200).json({ result: result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default PrescriptionController;
