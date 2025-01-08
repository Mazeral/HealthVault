import express from "express";
import PrescriptionController from "../controllers/PrescriptionController";
import { authMiddleware } from "../middlewares/AuthMiddleware";

const prescriptionRouter = express.Router();
// Create a prescription
prescriptionRouter.post(
  "/prescription/:id",
  authMiddleware as express.RequestHandler,
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
  authMiddleware as express.RequestHandler,
  PrescriptionController.updatePrescription,
);

// Delete a prescription
prescriptionRouter.delete(
  "/prescription/:id",
  authMiddleware as express.RequestHandler,
  PrescriptionController.deletePrescription,
);

export default prescriptionRouter;
