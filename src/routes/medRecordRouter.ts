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
  "/medical-record/:id",
  authMiddleware as express.RequestHandler,
  MedRecordController.updateMedRecord,
);

export default medRecordRouter;
