import express from "express";
import MedRecordController from "../controllers/MedRecordController";

const medRecordRouter = express.Router();
// Create a medical record for a patient
medRecordRouter.post("/medical-record/", MedRecordController.addRecord);

// update the medical history
medRecordRouter.put("/medical-record/:id", MedRecordController.updateMedRecord);

export default medRecordRouter;
