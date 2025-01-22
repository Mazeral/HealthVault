import express from "express";
import MedRecordController from "../controllers/MedRecordController";
import { authMiddleware } from "../middlewares/AuthMiddleware";

const medRecordRouter = express.Router();
// Create a medical record for a patient
medRecordRouter.post(
  "/medical-record/",
  authMiddleware as express.RequestHandler,
  MedRecordController.addRecord,
);

// update the medical history
medRecordRouter.put(
  "/medical-records/:id",
  authMiddleware as express.RequestHandler,
  MedRecordController.updateMedRecord,
);

medRecordRouter.get(
  "/medical-records",
  authMiddleware as express.RequestHandler,
  MedRecordController.allMedicalRecords,
);

medRecordRouter.delete(
  "/medical-records/:id",
  authMiddleware as express.RequestHandler,
  MedRecordController.deleteRecord,
);
// New route for fetching medical records for the authenticated user
medRecordRouter.get(
  "/my-medical-records",
  authMiddleware as express.RequestHandler,
  MedRecordController.getMyMedicalRecords,
);

export default medRecordRouter;
