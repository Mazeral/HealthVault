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

    try {
      if (!testName) throw Error("No test Name provided");
      if (!result) throw Error("No result provided");
      if (!performedAt) throw Error("No performed At provided");
      if (!patientId) throw Error("No patient ID provided");

      const labResult = await prisma.labResult.create({
        data: {
          testName: testName,
          result: result,
          notes: notes,
          performedAt: performedAt,
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
        )
          res.status(400).json({ error: error.message });
        else res.status(500).json({ error: error.message });
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

      if (!labResultId) throw Error("Lab test ID not provided");

      const data = createObject({
        patientId: Number(req.body.patientId),
        testName: req.body.testName,
        result: req.body.result,
        notes: req.body.notes,
        performedAt: Date.parse(String(req.body.performedAt)),
      });

      const updates = await prisma.labResult.updateMany({
        where: {
          id: labResultId,
        },
        data: data,
      });
      if (data.patientId)
        await prisma.labResult.update({
          where: {
            id: labResultId,
          },
          data: {
            patient: {
              connect: {
                id: Number(data.patientId),
              },
            },
          },
        });
      res.status(200).json({ updated: updates });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Lab test ID not provided")
          res.status(400).json({ error: error.message });
        else res.status(500).json({ error: error.message });
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
