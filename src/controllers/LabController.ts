import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { LabResult } from "@prisma/client";
import createObject from "../utils/utilFunctions";
class LabController {
  // Create a lab result for a patient
  static async newLabResult(req: Request, res: Response) {
    const patientId = Number(req.body.patientId) || null;
    const testName = String(req.body.testName) || null;
    const result = String(req.body.result) || null;
    const notes = String(req.body.notes) || null;
    const performedAt = String(req.body.performedAt) || null;
    let performedAtDate = null;

    try {
      // Validate required fields
      if (!testName) throw new Error("No test name provided");
      if (!result) throw new Error("No result provided");
      if (!patientId) throw new Error("No patient ID provided");

      // Convert performedAt to a valid DateTime object
      if (performedAt !== null)
        performedAtDate = new Date(performedAt).toISOString();
      else performedAtDate = new Date(Date.now()).toISOString();

      // Create the lab result
      const labResult = await prisma.labResult.create({
        data: {
          testName,
          result,
          notes,
          performedAt: performedAtDate, // Use the formatted DateTime
          patient: {
            connect: { id: patientId },
          },
        },
      });

      res.status(200).json({ "Lab result": labResult });
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message === "No test name provided" ||
          error.message === "No patient ID provided" ||
          error.message === "No result provided" ||
          error.message === "No performed At provided"
        ) {
          res.status(400).json({ error: error.message });
        } else {
          res.status(500).json({ error: error.message });
        }
      }
    }
  }

  // Fetch a lab result by id
  static async getLabResult(req: Request, res: Response) {
    try {
      const labResultId = req.params.id; // Get the raw string value

      // Check if the ID is an empty string or missing
      if (!labResultId || labResultId.trim() === "") {
        throw new Error("No lab result ID provided");
      }

      // Convert the ID to a number
      const id = Number(labResultId);

      // Check if the ID is a valid number
      if (isNaN(id)) {
        throw new Error("Invalid lab result ID");
      }

      const labResult = await prisma.labResult.findUnique({
        where: {
          id: id,
        },
      });

      res.status(200).json({ "Lab result": labResult });
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message === "No lab result ID provided" ||
          error.message === "Invalid lab result ID" ||
          error.message === "Lab result not found"
        )
          res.status(400).json({ error: error.message });
        else res.status(500).json({ error: error.message });
      }
    }
  }

  // gets all the lab results from the database
  static async allLabResults(req: Request, res: Response) {
    try {
      const labResults: LabResult[] = await prisma.labResult.findMany();
      res.status(200).json({ "Lab results": labResults });
    } catch (error) {
      if (error instanceof Error)
        res.status(500).json({ error: error.message });
    }
  }

  // update a lab result
  static async updateLabResult(req: Request, res: Response) {
    try {
      const labResultId = Number(req.params.id);
      if (!labResultId) throw new Error("Lab test ID not provided");

      // Validate required fields
      const { patientId, testName, result, notes, performedAt } = req.body;
      if (!patientId && !testName && !result && !notes && !performedAt) {
        throw new Error("No fields provided for update");
      }

      // Create an object with only the provided fields
      const data = createObject({
        patientId: patientId ? Number(patientId) : undefined,
        testName,
        result,
        notes,
        performedAt: performedAt ? new Date(performedAt) : undefined, // Convert to Date object
      });

      // Update the lab result
      const updatedResult = await prisma.labResult.update({
        where: {
          id: labResultId, // Use the lab result ID
        },
        data,
      });

      res.status(200).json({ updated: updatedResult });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Lab test ID not provided") {
          res.status(400).json({ error: error.message });
        } else if (error.message === "No fields provided for update") {
          res.status(400).json({ error: error.message });
        } else {
          res.status(500).json({ error: error.message });
        }
      }
    }
  }

  // Delete a lab result
  static async deleteLabResult(req: Request, res: Response) {
    try {
      const labResultId = Number(req.params.id) || undefined;
      if (!labResultId) {
        throw Error("Bad request");
      }

      const result = await prisma.labResult.delete({
        where: {
          id: labResultId,
        },
      });
      res.status(200).json({ result: result });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Bad request")
          res.status(400).json({ error: error.message });
        res.status(500).json({ error: error.message });
      }
    }
  }
}
export default LabController;
