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

**Add a medical record for the patient**
```js
router.post('/patients/:id/medical-record', PatientController.addRecord);
```

**Update the medical record**
```js
router.put('/medical-record/:id', MedRecordController.updateMedRecord);
```

**Get the medical record**
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

**Create a lab result**
```js
router.post('/lab-results/:id', LabController.newLabResult);
```

**Get a lab result**
```js
router.get('/lab-result/:id', LabController.getLabResult);
```

**Get all lab results**
```js
router.get('/lab-results', LabController.allLabResults);
```

**Update a lab result**
```js
router.put('/lab-results/:id', LabController.updateLabResult);
```

**Delete a lab result**
```js
router.delete('/lab-results/:id', LabController.deleteLabResult);
```

**Get a user**
```js
router.get('/user/:id', UserController.getUser);
```

**Get all users**
```js
router.get('/users', UserController.allUsers);
```

**Create a user**
```js
router.post('/users', UserController.newUser)
```

**Update a user**
```js
router.put('/user/:id', UserController.updateUser);
```

**Add a paitent to te user**
```js
router.put('/user/:id', UserController.updateUser);
```

**Delete a user**
```js
router.delete('/user/:id', UserController.deleteUser);
```
