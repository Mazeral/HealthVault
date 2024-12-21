import express from 'express';
import PatientController from '../controllers/PatientController';
import MedRecordController from '../controllers/MedRecordController';
import PrescriptionController from '../controllers/PrescriptionController';

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

// Create a prescription
router.post('/prescription/:id', PrescriptionController.newPrescription);

// Get a prescription
router.get('/prescription/:id', PrescriptionController.getPrescription);

// Get all prescriptions
router.get('/prescription', PrescriptionController.allPrescriptions);

// Update a prescription
router.put('/prescription/:id', PrescriptionController.updatePrescription);

// Delete a prescription
router.delete('/prescription/:id', PrescriptionController.deletePrescription);

export default router;
