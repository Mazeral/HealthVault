# HealthVault
## Backend API Documentation

This document provides an overview of the backend API for a healthcare management system. The API is built using **Express.js** and **Prisma** for database management. It supports user authentication, patient management, medical records, lab results, and prescriptions. The API is designed to be consumed by a frontend application, enabling seamless integration with the healthcare system.

---

## Table of Contents
1. [Getting Started](#getting-started)
2. [API Endpoints](#api-endpoints)
   - [Authentication](#authentication)
   - [Patients](#patients)
   - [Medical Records](#medical-records)
   - [Lab Results](#lab-results)
   - [Prescriptions](#prescriptions)
   - [Users](#users)
3. [Database Schema](#database-schema)
4. [Environment Variables](#environment-variables)
5. [Error Handling](#error-handling)
6. [Session Management](#session-management)
7. [Redis Integration](#redis-integration)
8. [CORS Configuration](#cors-configuration)

---

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MySQL database
- Redis (for session management)
- Prisma CLI (`npm install -g prisma`)

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-folder>
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the database:
   - Update the `.env` file with your MySQL database URL:
     ```env
     DATABASE_URL="mysql://user:password@localhost:3306/database_name"
     ```
   - Run Prisma migrations:
     ```bash
     npx prisma migrate dev --name init
     ```
4. Start the server:
   ```bash
   npm start
   ```
   The server will run on `http://localhost:5000`.

---

## API Endpoints

### Authentication
- **POST `/auth/login`**: Log in a user.
  - Request Body:
    ```json
    {
      "user": "username",
      "password": "password"
    }
    ```
  - Response:
    ```json
    {
      "login": "success"
    }
    ```

- **GET `/auth/logout`**: Log out the current user.
  - Response:
    ```json
    {
      "logout": "success"
    }
    ```

- **POST `/auth/check-auth`**: Check if the user is authenticated.
  - Response:
    ```json
    {
      "userId": "1",
      "role": "ADMIN"
    }
    ```

---

### Patients
- **POST `/patients`**: Create a new patient.
  - Request Body:
    ```json
    {
      "firstName": "John",
      "lastName": "Doe",
      "dateOfBirth": "1990-01-01",
      "phone": "1234567890",
      "email": "john.doe@example.com",
      "address": "123 Main St"
    }
    ```
  - Response:
    ```json
    {
      "Patient data:": {
        "id": 1,
        "firstName": "John",
        "lastName": "Doe",
        "dateOfBirth": "1990-01-01T00:00:00.000Z",
        "phone": "1234567890",
        "email": "john.doe@example.com",
        "address": "123 Main St"
      }
    }
    ```

- **GET `/patients/:id`**: Get a patient by ID.
  - Response:
    ```json
    {
      "patient": {
        "id": 1,
        "firstName": "John",
        "lastName": "Doe",
        "dateOfBirth": "1990-01-01T00:00:00.000Z",
        "phone": "1234567890",
        "email": "john.doe@example.com",
        "address": "123 Main St"
      }
    }
    ```

- **PUT `/patients/:id`**: Update a patient by ID.
  - Request Body:
    ```json
    {
      "firstName": "Jane",
      "lastName": "Doe"
    }
    ```
  - Response:
    ```json
    {
      "updated": {
        "count": 1
      }
    }
    ```

---

### Medical Records
- **POST `/medical-record`**: Add a medical record for a patient.
  - Request Body:
    ```json
    {
      "patientId": 1,
      "diagnosis": "Flu",
      "notes": "Patient reported fever and cough."
    }
    ```
  - Response:
    ```json
    {
      "success": {
        "id": 1,
        "patientId": 1,
        "diagnosis": "Flu",
        "notes": "Patient reported fever and cough."
      }
    }
    ```

- **GET `/patients/:id/medical-record`**: Get a medical record by patient ID.
  - Response:
    ```json
    {
      "Medical Record": {
        "id": 1,
        "patientId": 1,
        "diagnosis": "Flu",
        "notes": "Patient reported fever and cough."
      }
    }
    ```

---

### Lab Results
- **POST `/lab-results/:id`**: Create a new lab result for a patient.
  - Request Body:
    ```json
    {
      "patientId": 1,
      "testName": "Blood Test",
      "result": "Normal",
      "notes": "No abnormalities detected.",
      "performedAt": "2023-10-01T12:00:00.000Z"
    }
    ```
  - Response:
    ```json
    {
      "Lab result": {
        "id": 1,
        "patientId": 1,
        "testName": "Blood Test",
        "result": "Normal",
        "notes": "No abnormalities detected.",
        "performedAt": "2023-10-01T12:00:00.000Z"
      }
    }
    ```

- **GET `/lab-results`**: Get all lab results.
  - Response:
    ```json
    {
      "Lab results": [
        {
          "id": 1,
          "patientId": 1,
          "testName": "Blood Test",
          "result": "Normal",
          "notes": "No abnormalities detected.",
          "performedAt": "2023-10-01T12:00:00.000Z"
        }
      ]
    }
    ```

---

### Prescriptions
- **POST `/prescription/:id`**: Create a new prescription for a patient.
  - Request Body:
    ```json
    {
      "patientId": 1,
      "medication": "Paracetamol",
      "dosage": "500mg",
      "instructions": "Take twice daily."
    }
    ```
  - Response:
    ```json
    {
      "prescription": {
        "id": 1,
        "patientId": 1,
        "medication": "Paracetamol",
        "dosage": "500mg",
        "instructions": "Take twice daily."
      }
    }
    ```

- **GET `/prescription/:id`**: Get a prescription by ID.
  - Response:
    ```json
    {
      "prescription": {
        "id": 1,
        "patientId": 1,
        "medication": "Paracetamol",
        "dosage": "500mg",
        "instructions": "Take twice daily."
      }
    }
    ```

---

### Users
- **POST `/users`**: Create a new user.
  - Request Body:
    ```json
    {
      "name": "admin",
      "email": "admin@example.com",
      "password": "password",
      "role": "ADMIN"
    }
    ```
  - Response:
    ```json
    {
      "user": {
        "id": 1,
        "name": "admin",
        "email": "admin@example.com",
        "role": "ADMIN"
      }
    }
    ```

---

## Database Schema
The database schema is defined using Prisma. Key models include:
- **User**: Stores user information (name, email, password, role).
- **Patient**: Stores patient information (name, date of birth, contact details).
- **MedicalRecord**: Stores medical records linked to patients.
- **Prescription**: Stores prescriptions linked to patients.
- **LabResult**: Stores lab results linked to patients.

---

## Environment Variables
- `DATABASE_URL`: MySQL database connection URL.
- `PORT`: Port on which the server runs (default: `5000`).
- `SESSION_SECRET`: Secret key for session management.

---

## Error Handling
The API returns appropriate HTTP status codes and error messages:
- `400`: Bad request (e.g., missing fields).
- `401`: Unauthorized (e.g., invalid credentials).
- `404`: Not found (e.g., patient not found).
- `500`: Internal server error.

---

## Session Management
Sessions are managed using **express-session** with **Redis** for storage. Sessions are valid for 24 hours.

---

## Redis Integration
Redis is used for session storage. Ensure Redis is running and configured in the `.env` file.

---

## CORS Configuration
CORS is enabled for all origins (`*`). The API allows `GET`, `POST`, `PUT`, `DELETE`, and `OPTIONS` methods.

---

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.

---

For any questions or issues, please contact the development team.
