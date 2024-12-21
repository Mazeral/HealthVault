# HealthVault
HealthVault is a comprehensive Electronic Health Records (EHRs) system designed to streamline healthcare operations, improve patient care, and enhance the overall efficiency of healthcare providers. 

# Routes:

**Creates a new patient without any health records**
```js
router.post('/patients', PatientController.newPatient);
```

**Gets a patient by id**
```js
router.get('/patients/:id', PatientController.getPatient);
```

**Get a list of patients by data**
```js
router.get('/patients', PatientController.getPatients);
```

**Updates a patient by id**
```js
router.put('/patients/:id', PatientController.updatePatient);
```

**Add a medical history for the patient**
```js
router.post('/patients/:id/medical-record', PatientController.addRecord);
```

**Update the medical history**
```js
router.put('/medical-record/:id', MedRecordController.updateMedRecord);
```

**Get the medical history**
```js
router.get('/patients/:id/medical-record', MedRecordController.getMedRecord);
```

**Delete a record**
```js
router.delete('/medical-record/:id', MedRecordController.deleteRecord);
```

**Create a prescription**
```js
router.post('/prescription/:id', PrescriptionController.newPrescription);
```

**Get a prescription**
```js
router.get('/prescription/:id', PrescriptionController.getPrescription);
```

**Get all prescriptions**
```js
router.get('/prescription', PrescriptionController.allPrescriptions);
```

**Update a prescription**
```js
router.put('/prescription/:id', PrescriptionController.updatePrescription);
```

**Delete a prescription**
```js
router.delete('/prescription/:id', PrescriptionController.deletePrescription);
```
