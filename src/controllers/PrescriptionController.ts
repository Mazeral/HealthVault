import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { CustomSessionData } from "../types";

class PrescriptionController {
  // Create a new prescription
  static async newPrescription(req: Request, res: Response) {
    try {
      const { patientFullName, medication, dosage, instructions } = req.body;

      if (!patientFullName || !medication || !dosage) {
        throw new Error("Missing required fields");
      }

      // Get the user ID from the session
      const session = req.session as CustomSessionData;
      const userId = Number(session.user?.id);

      if (!userId) {
        throw new Error("Unauthorized: No user ID found in session");
      }

      // Create or find the patient
      let patient = await prisma.patient.findFirst({
        where: { fullName: patientFullName, userId },
      });

      if (!patient) {
        throw Error("No patient found");
      }

      // Create the prescription
      const prescription = await prisma.prescription.create({
        data: {
          patientId: patient.id,
          medication,
          dosage,
          instructions,
          userId,
        },
        include: {
          patient: true,
        },
      });

      res.status(200).json({ prescription });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "No patient found")
          res.status(404).json({ error: error.message });
        else if (error.message === "Missing required fields") {
          res.status(400).json({ error: error.message });
        } else {
          res.status(500).json({ error: error.message });
        }
      }
    }
  }

  // Get a prescription by ID
  static async getPrescription(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (!id) throw new Error("No ID provided");

      const prescription = await prisma.prescription.findUnique({
        where: { id },
        include: {
          User: true, // Include the user who created the prescription
        },
      });

      if (!prescription) throw new Error("Prescription not found");

      res.status(200).json({ prescription });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "No ID provided")
          res.status(400).json({ error: error.message });
        else if (error.message === "Prescription not found") {
          res.status(404).json({ error: error.message });
        } else {
          res.status(500).json({ error: error.message });
        }
      }
    }
  }

  // Get all prescriptions
  static async allPrescriptions(req: Request, res: Response) {
    try {
      const prescriptions = await prisma.prescription.findMany({
        include: {
          patient: {
            select: {
              fullName: true, // Include the patient's full name
            },
          },
          User: true, // Include the user who created the prescription
        },
      });

      res.status(200).json({ prescriptions });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      }
    }
  }

  // Update a prescription
  static async updatePrescription(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const { patientFullName, medication, dosage, instructions } = req.body;

      if (!id) throw new Error("No ID provided");

      // Find the prescription
      const prescription = await prisma.prescription.findUnique({
        where: { id },
      });

      if (!prescription) throw new Error("Prescription not found");

      // Find or create the patient
      let patient = await prisma.patient.findFirst({
        where: { fullName: patientFullName, userId: prescription.userId },
      });

      if (!patient) {
        throw new Error("No patient found");
      }

      // Update the prescription
      const updatedPrescription = await prisma.prescription.update({
        where: { id },
        data: {
          patientId: patient.id,
          medication,
          dosage,
          instructions,
        },
        include: {
          patient: true, // Include the patient object in the response
        },
      });

      // Add the patientFullName field to the response
      const response = {
        ...updatedPrescription,
        patientFullName: updatedPrescription.patient?.fullName || "Unknown",
      };

      res.status(200).json({ updated: response });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "No ID provided")
          res.status(400).json({ error: error.message });
        else if (error.message === "Prescription not found") {
          res.status(404).json({ error: error.message });
        } else {
          res.status(500).json({ error: error.message });
        }
      }
    }
  }

  // Delete a prescription
  static async deletePrescription(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (!id) throw new Error("No ID provided");

      await prisma.prescription.delete({
        where: { id },
      });

      res.status(200).json({ message: "Prescription deleted successfully" });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "No ID provided") {
          res.status(404).json({ error: error.message });
        } else {
          res.status(500).json({ error: error.message });
        }
      }
    }
  }
  static async getMyPrescriptions(req: Request, res: Response) {
    try {
      const session = req.session as CustomSessionData; // Cast session to CustomSessionData
      const userId = session.user?.id; // Get the user ID from the session

      if (!userId) {
        throw new Error("Unauthorized: No user ID found in session");
      }

      // Fetch prescriptions for the user
      const prescriptions = await prisma.prescription.findMany({
        where: {
          patient: {
            userId: Number(userId), // Filter by the user's ID
          },
        },
        include: {
          patient: {
            select: {
              fullName: true, // Include only the fullName of the patient
            },
          },
        },
      });
      res.status(200).json({ prescriptions });
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

export default PrescriptionController;
