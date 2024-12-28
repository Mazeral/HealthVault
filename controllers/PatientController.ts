import { Request, Response } from "express";
import prisma from "../utils/prisma";

class PatientController {
  // creates a patient without health records
  static async newPatient(req: Request, res: Response) {
    const firstName = String(req.body.firstName) || null;
    const lastName = String(req.body.lastName) || null;
    const dateOfBirth = new Date(req.body.dateOfBirth) || null;
    const phone = String(req.body.phone) || null;
    const email = String(req.body.email) || null;
    const address = String(req.body.phone) || null;
    try {
      if (!firstName || !lastName) {
        throw Error(`Missing name field`);
      }
      const result = await prisma.patient.create({
        data: {
          firstName: firstName,
          lastName: lastName,
          dateOfBirth: new Date(dateOfBirth),
          phone: phone,
          email: email,
          address: address,
        },
      });
      res.status(200).json({ "Patient data:": result });
    } catch (error) {
      if (error.message === "Missing name field")
        res.status(400).json({ error: error.message });
      else res.status(500).json({ error: error.message });
    }
  }

  // Gets a patient with id
  static async getPatient(req: Request, res: Response) {
    const id = req.params.id ? Number(req.params.id) : null;

    try {
      if (!id) throw Error("No id provided");

      const patient = await prisma.patient.findUnique({
        where: {
          id: id,
        },
      });
      if (!patient) throw Error("No patient found");
      res.status(200).json({ patient: patient });
    } catch (error) {
      if (error.message === "No id provided")
        res.status(400).json({ error: error.message });
      else if (error.message === "No patient found")
        res.status(404).json({ error: error.message });
      else res.status(500).json({ error: error.message });
    }
  }

  // Updates a patient by id
  static async updatePatient(req: Request, res: Response) {
    const id = Number(req.params.id) || null;

    try {
      if (!id) throw Error("No id provided");

      const patient = await prisma.patient.findUnique({
        where: {
          id: id,
        },
      });
      if (!patient) throw Error("No patient found");

      const allowedFields = [
        "firstName",
        "lastName",
        "dateOfBirth",
        "phone",
        "email",
        "address",
      ];

      const data = Object.fromEntries(
        Object.entries(req.body).filter(
          ([key, value]) => allowedFields.includes(key) && value !== undefined,
        ),
      );

      if (data.dateOfBirth)
        data.dateOfBirth = Date.parse(String(data.dateOfBirth));
      const result = await prisma.patient.updateMany({
        where: {
          id: id,
        },
        data: data,
      });
      res.status(200).json({ updated: result });
    } catch (error) {
      if (error.message === "No id provided")
        res.status(400).json({ error: error.message });
      else if (error.message === "No patient found")
        res.status(404).json({ error: error.message });
      else res.status(500).json({ error: error.message });
    }
  }

  // Search for a patient according to the request
  static async getPatients(req: Request, res: Response) {
    try {
      const allowedFields = [
        "firstName",
        "lastName",
        "dateOfBirth",
        "phone",
        "email",
        "address",
      ];

      const data = Object.fromEntries(
        Object.entries(req.body).filter(
          ([key, value]) => allowedFields.includes(key) && value !== undefined,
        ),
      );
      data.dateOfBirth = Date.parse(String(data.dateOfBirth));
      if (!data.dateOfBirth) throw Error("Bad date of birth");
      const patients = await prisma.patient.findMany({
        where: {
          firstName: String(data.firstName),
          lastName: String(data.lastName),
          dateOfBirth: String(data.dateOfBirth),
          phone: String(data.phone),
          email: String(data.email),
          address: String(data.address),
        },
      });
      // If no aptients, no error it's doing it's job
      res.status(200).json({ paitents: patients });
    } catch (error) {
      if (error.message === "Bad date of birth")
        res.status(400).json({ error: error.message });
      else res.status(500).json({ error: error.message });
    }
  }

  static async addRecord(req: Request, res: Response) {
    // Adds a medical record for the patient.
    // Prisma handles the relation linking automatically
    try {
      const patientId = Number(req.params.id) || null;
      const diagnosis = String(req.body.diagnosis);
      const notes = String(req.body.notes) || null;

      if (!patientId) throw Error("No id provided");
      const patient = await prisma.patient.findUnique({
        where: {
          id: patientId,
        },
      });
      if (!patient) throw Error("No patient found");

      const record = await prisma.medicalRecord.create({
        data: {
          notes: notes,
          diagnosis: diagnosis,
          patient: {
            connect: {
              id: Number(patientId),
            },
          },
        },
      });
      res.status(200).json({ updated: record });
    } catch (error) {
      if (error.message === "No id provided")
        res.status(400).json({ error: error.message });
      else if (error.message === "No patient found")
        res.status(404).json({ error: error.message });
      else res.status(500).json({ error: error.message });
    }
  }

  static async getLabResults(req: Request, res: Response) {
    try {
      const patientId = req.params.id || null;

      if (!patientId) throw Error("No id provided");
      const patient = await prisma.patient.findUnique({
        where: {
          id: Number(patientId),
        },
      });
      if (!patient) throw Error("No patient found");

      const labResults = await prisma.labResult.findMany();
      res.status(200).json({ "Lab Results": labResults });
    } catch (error) {
      if (error.message === "No id provided")
        res.status(400).json({ error: error.message });
      else if (error.message === "No patient found")
        res.status(404).json({ error: error.message });
      else res.status(500).json({ error: error.message });
    }
  }
}

export default PatientController;
