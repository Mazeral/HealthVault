import express from "express";
import PrescriptionController from "../controllers/PrescriptionController";

const prescriptionRouter = express.Router();
// Create a prescription
prescriptionRouter.post(
  "/prescription/:id",
  PrescriptionController.newPrescription,
);

// Get a prescription
prescriptionRouter.get(
  "/prescription/:id",
  PrescriptionController.getPrescription,
);

// Get all prescriptions
prescriptionRouter.get(
  "/prescription",
  PrescriptionController.allPrescriptions,
);

// Update a prescription
prescriptionRouter.put(
  "/prescription/:id",
  PrescriptionController.updatePrescription,
);

// Delete a prescription
prescriptionRouter.delete(
  "/prescription/:id",
  PrescriptionController.deletePrescription,
);

export default prescriptionRouter;
