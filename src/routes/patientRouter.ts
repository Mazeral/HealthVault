import express from "express";
import PatientController from "../controllers/PatientController";
import MedRecordController from "../controllers/MedRecordController";
import { authMiddleware } from "../middlewares/AuthMiddleware";

const patientRouter = express.Router();

// Get all the patients
patientRouter.get("/patients");

// Creates a new patient without any health records
patientRouter.post(
  "/patients",
  authMiddleware as express.RequestHandler,
  PatientController.newPatient,
);

// Gets a patient by id
patientRouter.get(
  "/patients/:id",
  authMiddleware as express.RequestHandler,
  PatientController.getPatient,
);

// Get a list of patients by data
patientRouter.get("/patients", PatientController.getPatients);

// Updates a patient by id
patientRouter.put(
  "/patients/:id",
  authMiddleware as express.RequestHandler,
  PatientController.updatePatient,
);

// Add a medical history for the patient
patientRouter.post(
  "/patients/:id/medical-record",
  authMiddleware as express.RequestHandler,
  PatientController.addRecord,
);

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

// delete a patient
patientRouter.delete(
  "/patients/:id",
  authMiddleware as express.RequestHandler,
  PatientController.deletePatient,
);

// statistics
patientRouter.get("/patients/statistics",
	authMiddleware as express.RequestHandler,
	PatientController.getStatistics);

export default patientRouter;
