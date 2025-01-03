import express from "express";
import PatientController from "../controllers/PatientController";
import MedRecordController from "../controllers/MedRecordController";

const patientRouter = express.Router();

// Creates a new patient without any health records
patientRouter.post("/patients", PatientController.newPatient);

// Gets a patient by id
patientRouter.get("/patients/:id", PatientController.getPatient);

// Get a list of patients by data
patientRouter.get("/patients", PatientController.getPatients);

// Updates a patient by id
patientRouter.put("/patients/:id", PatientController.updatePatient);

// Add a medical history for the patient
patientRouter.post("/patients/:id/medical-record", PatientController.addRecord);

// Get the medical history
patientRouter.get(
  "/patients/:id/medical-record",
  MedRecordController.getMedRecord,
);

// Get the lab results
patientRouter.get(
  "/patients/:id/lab-results",
  MedRecordController.getLabResults,
);

export default patientRouter;
