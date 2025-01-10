# Backend Documentation for Frontend Developers

## Overview

This README provides a guide for frontend developers to understand and interact with the backend API. The backend is built using Express.js, Prisma, and MySQL, and it exposes various endpoints for managing users, patients, medical records, prescriptions, lab results, and more.

## Table of Contents

1. **Setup and Installation**
2. **Environment Variables**
3. **API Endpoints**
   - Authentication
   - Users
   - Patients
   - Medical Records
   - Prescriptions
   - Lab Results
   - Dashboard
4. **Authentication**
5. **Error Handling**
6. **Data Models**
7. **Testing the API**
8. **Troubleshooting**
9. **Contributing**

## 1. Setup and Installation

### Prerequisites

- Node.js installed on your machine.
- MySQL database installed and running.
- Redis installed and running for session storage (optional but recommended).

### Installation Steps

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/your-repo.git
   cd your-repo
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Setup Environment Variables:**

   Create a `.env` file in the root directory with the required environment variables (see the next section).

4. **Run the backend server:**

   ```bash
   npm start
   ```

## 2. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
PORT=5000
DATABASE_URL=mysql://username:password@localhost:3306/database_name
SALT=10
SESSION_SECRET=your-secret-key
```

- **PORT:** The port on which the server will run.
- **DATABASE_URL:** The connection URL for your MySQL database.
- **SALT:** The number of rounds for bcrypt password hashing.
- **SESSION_SECRET:** A secret string used to sign session cookies.

## 3. API Endpoints

### Authentication

#### POST /auth/login

- **Description:** Logs in a user and sets a session cookie.
- **Request Body:**
  ```json
  {
    "user": "username",
    "password": "password"
  }
  ```
- **Response:**
  ```json
  {
    "login": "success"
  }
  ```
- **Status Codes:**
  - 200: Success
  - 400: Missing username or password
  - 401: Invalid credentials
  - 500: Server error

#### GET /auth/logout

- **Description:** Logs out the user and clears the session cookie.
- **Response:**
  ```json
  {
    "logout": "success"
  }
  ```
- **Status Codes:**
  - 200: Success
  - 500: Server error

#### POST /auth/check-auth

- **Description:** Checks if the user is authenticated.
- **Response:**
  ```json
  {
    "userId": "user-id",
    "role": "user-role"
  }
  ```
- **Status Codes:**
  - 200: Success
  - 401: Unauthorized
  - 500: Server error

### Users

#### POST /users

- **Description:** Creates a new user.
- **Request Body:**
  ```json
  {
    "name": "User Name",
    "email": "user@example.com",
    "password": "password",
    "role": "ADMIN"
  }
  ```
- **Response:**
  ```json
  {
    "new user:": {
      // User data
    }
  }
  ```
- **Status Codes:**
  - 200: Success
  - 400: Missing fields
  - 500: Server error

#### GET /user/:id

- **Description:** Gets a user by ID.
- **Params:**
  - `id`: User ID
- **Response:**
  ```json
  {
    "user": {
      // User data
    }
  }
  ```
- **Status Codes:**
  - 200: Success
  - 400: Missing ID
  - 404: User not found
  - 500: Server error

### Patients

#### POST /patients

- **Description:** Creates a new patient.
- **Request Body:**
  ```json
  {
    "fullName": "Patient Name",
    "dateOfBirth": "2000-01-01",
    "phone": "1234567890",
    "email": "patient@example.com",
    "address": "Patient Address"
  }
  ```
- **Response:**
  ```json
  {
    "Patient data:": {
      // Patient data
    }
  }
  ```
- **Status Codes:**
  - 200: Success
  - 400: Missing fullName
  - 500: Server error

#### GET /patients/:id

- **Description:** Gets a patient by ID.
- **Params:**
  - `id`: Patient ID
- **Response:**
  ```json
  {
    "patient": {
      // Patient data
    }
  }
  ```
- **Status Codes:**
  - 200: Success
  - 400: Missing ID
  - 404: Patient not found
  - 500: Server error

### Medical Records

#### POST /medical-record/

- **Description:** Adds a medical record for a patient.
- **Request Body:**
  ```json
  {
    "patientId": 1,
    "diagnosis": "Diagnosis",
    "notes": "Notes"
  }
  ```
- **Response:**
  ```json
  {
    "success": {
      // Medical record data
    }
  }
  ```
- **Status Codes:**
  - 200: Success
  - 400: Missing fields
  - 500: Server error

### Prescriptions

#### POST /prescriptions

- **Description:** Creates a new prescription.
- **Request Body:**
  ```json
  {
    "patientId": 1,
    "medication": "Medication",
    "dosage": "Dosage",
    "instructions": "Instructions"
  }
  ```
- **Response:**
  ```json
  {
    "prescription": {
      // Prescription data
    }
  }
  ```
- **Status Codes:**
  - 200: Success
  - 400: Missing fields
  - 500: Server error

### Lab Results

#### POST /lab-results

- **Description:** Creates a new lab result.
- **Request Body:**
  ```json
  {
    "patientId": 1,
    "testName": "Test Name",
    "result": "Result",
    "notes": "Notes",
    "performedAt": "2023-10-01T12:00:00Z"
  }
  ```
- **Response:**
  ```json
  {
    "Lab result": {
      // Lab result data
    }
  }
  ```
- **Status Codes:**
  - 200: Success
  - 400: Missing fields
  - 500: Server error

### Dashboard

#### GET /dashboard

- **Description:** Fetches dashboard metrics.
- **Response:**
  ```json
  {
    "metrics": [
      { "title": "Total Patients", "value": 10 },
      { "title": "Total Medical Records", "value": 20 },
      { "title": "Total Prescriptions", "value": 15 },
      { "title": "Total Lab Results", "value": 25 }
    ],
    "recentPatients": [/* Array of recent patients */],
    "recentLabResults": [/* Array of recent lab results */]
  }
  ```
- **Status Codes:**
  - 200: Success
  - 500: Server error

## 4. Authentication

- **Session-Based Authentication:** The backend uses session cookies to manage user sessions.
- **Middleware:** Certain routes are protected and require an active session.
- **Logout:** Clearing the session cookie logs the user out.

## 5. Error Handling

- **HTTP Status Codes:** The backend uses standard HTTP status codes to indicate the result of operations.
- **Error Messages:** Error responses include a JSON object with an `error` field describing the issue.

## 6. Data Models

### User

- **Fields:**
  - `id`: Unique identifier
  - `name`: User's name
  - `email`: User's email
  - `password`: Hashed password
  - `role`: User role (ADMIN, DOCTOR, NURSE)
  - `createdAt`: Creation timestamp
  - `updatedAt`: Last update timestamp
  - `patients`: Related patients (array of Patient objects)

### Patient

- **Fields:**
  - `id`: Unique identifier
  - `fullName`: Patient's full name
  - `dateOfBirth`: Date of birth
  - `phone`: Phone number
  - `email`: Email address
  - `address`: Address
  - `createdAt`: Creation timestamp
  - `updatedAt`: Last update timestamp
  - `medicalRecords`: Related medical records
  - `prescriptions`: Related prescriptions
  - `labResults`: Related lab results
  - `User`: Associated user (nullable)

### MedicalRecord

- **Fields:**
  - `id`: Unique identifier
  - `patientId`: Foreign key to Patient
  - `diagnosis`: Diagnosis
  - `notes`: Additional notes
  - `createdAt`: Creation timestamp
  - `updatedAt`: Last update timestamp

### Prescription

- **Fields:**
  - `id`: Unique identifier
  - `patientId`: Foreign key to Patient
  - `medication`: Medication name
  - `dosage`: Dosage instructions
  - `instructions`: Prescription instructions
  - `prescribedAt`: Prescription date

### LabResult

- **Fields:**
  - `id`: Unique identifier
  - `patientId`: Foreign key to Patient
  - `testName`: Name of the test
  - `result`: Test result
  - `notes`: Additional notes
  - `performedAt`: Date the test was performed
  - `createdAt`: Creation timestamp

## 7. Testing the API

- **Tools:** Use tools like Postman, Insomnia, or curl to test the API endpoints.
- **Sample Request:**

  ```bash
  curl -X POST http://localhost:5000/auth/login -H "Content-Type: application/json" -d '{"user": "username", "password": "password"}'
  ```

## 8. Troubleshooting

- **Environment Variables:** Ensure all required environment variables are set correctly.
- **Database Connection:** Verify that the MySQL database is running and accessible.
- **Session Issues:** Clear cookies or try incognito mode if session-related problems occur.

## 9. Contributing

- **Code Style:** Follow the existing code style and formatting.
- **Testing:** Add tests for new features or bug fixes.
- **Documentation:** Update documentation accordingly for any changes.

---

This README provides a comprehensive guide for frontend developers to interact with the backend API effectively.
