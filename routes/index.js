import express from 'express';
import PatientController from '../controllers/PatientController';
import MedRecordController from '../controllers/MedRecordController';
import PrescriptionController from '../controllers/PrescriptionController';
import LabController from '../controllers/LabController';

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

// Create a medical record for a patient
router.post('/medical-record/', MedRecordController.addRecord)

// update the medical history
router.put('/medical-record/:id', MedRecordController.updateMedRecord);

// Get the medical history
router.get('/patients/:id/medical-record', MedRecordController.getMedRecord);

// Get the lab results
router.get('/patients/:id/lab-results', MedRecordController.getLabResults);

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

// Create a lab result
router.post('/lab-results/:id', LabController.newLabResult);

// Get a lab result
router.get('/lab-result/:id', LabController.getLabResult);

// Get all lab results
router.get('/lab-results', LabController.allLabResults);

// Update a lab result
router.put('/lab-results/:id', LabController.updateLabResult);

// Delete a lab result
router.delete('/lab-results/:id', LabController.deleteLabResult);

export default router;
