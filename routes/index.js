import express from 'express';
import PatientController from '../controllers/PatientController';
import MedRecordController from '../controllers/MedRecordController';

const router = express.Router();

// Creates a new patient without any health records
router.post('/patients', PatientController.newPatient);

// Gets a patient by id
router.get('/patients/:id', PatientController.getPatient);

// Get a list of patients by data
router.get('/patients', PatientController.getPatients);

// Updates a patient by id
router.put('/patients/:id', PatientController.updatePatient);

// Add a medical history for the patient
router.post('/patients/:id/medical-record', PatientController.addRecord);

// update the medical history
router.put('/medical-record/:id', MedRecordController.updateMedRecord);

// Get the medical history
router.get('/patients/:id/medical-record', MedRecordController.getMedRecord);

// Delete a record
router.delete('/medical-record/:id', MedRecordController.deleteRecord);

export default router;
