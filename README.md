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
