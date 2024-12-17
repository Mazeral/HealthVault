import express from 'express';
import PatientController from '../controllers/PatientController';

const router = express.Router();

// Creates a new patient without any health records
router.post('/patients', PatientController.newPatient);

// Gets a patient by id
router.get('/patients/:id', PatientController.getPatient);

// Updates a patient by it
router.put('/patients/:id', PatientController.updatePatient);
