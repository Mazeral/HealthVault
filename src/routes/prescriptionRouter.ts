import express from "express";
import PrescriptionController from "../controllers/PrescriptionController";
import { authMiddleware } from "../middlewares/AuthMiddleware";

const prescriptionRouter = express.Router();

// Create a prescription
prescriptionRouter.post(
  "/prescriptions",
  authMiddleware as express.RequestHandler,
  PrescriptionController.newPrescription,
);

// Get a prescription by ID
prescriptionRouter.get(
  "/prescriptions/:id",
  PrescriptionController.getPrescription,
);

// Get all prescriptions
prescriptionRouter.get(
  "/prescriptions",
  PrescriptionController.allPrescriptions,
);

// Update a prescription
prescriptionRouter.put(
  "/prescriptions/:id",
  authMiddleware as express.RequestHandler,
  PrescriptionController.updatePrescription,
);

// Delete a prescription
prescriptionRouter.delete(
  "/prescriptions/:id",
  authMiddleware as express.RequestHandler,
  PrescriptionController.deletePrescription,
);

// New route for fetching prescriptions for the authenticated user
prescriptionRouter.get(
  "/my-prescriptions",
  authMiddleware as express.RequestHandler,
  PrescriptionController.getMyPrescriptions,
);
export default prescriptionRouter;
