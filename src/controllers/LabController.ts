import { Request, Response } from "express";
import prisma from "../utils/prisma";
import createObject from "../utils/utilFunctions";
import { CustomSessionData } from "../types";
class LabController {
  // Create a lab result for a patient
static async newLabResult(req: Request, res: Response) {
  const { patientFullName, testName, result, notes, performedAt } = req.body;

  try {
    // Log the request body for debugging
    console.log('Request body:', req.body);

    // Validate required fields
    if (!testName) throw new Error("No test name provided");
    if (!result) throw new Error("No result provided");
    if (!patientFullName) throw new Error("No patient full name provided");

    // Fetch patient ID based on full name
    console.log('Searching for patient:', patientFullName);
    const patient = await prisma.patient.findFirst({
      where: {
        fullName: patientFullName,
      },
    });

    if (!patient) {
      throw new Error("Patient not found");
    }

    console.log('Patient found:', patient);

    const patientId = patient.id;

    // Convert performedAt to a valid DateTime object
    const performedAtDate = performedAt ? new Date(performedAt).toISOString() : new Date(Date.now()).toISOString();

    // Create the lab result
    const labResult = await prisma.labResult.create({
      data: {
        testName,
        result,
        notes,
        performedAt: performedAtDate,
        patient: {
          connect: { id: patientId },
        },
      },
    });

    console.log('Lab result created:', labResult);

    res.status(200).json({ "Lab result": labResult });
  } catch (error) {
    console.error('Error creating lab result:', error);
    if (error instanceof Error) {
      if (
        error.message === "No test name provided" ||
        error.message === "No patient full name provided" ||
        error.message === "No result provided" ||
        error.message === "Patient not found"
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
      const labResults = await prisma.labResult.findMany({
        include: {
          patient: {
            select: {
              fullName: true, // Include the patient's full name
            },
          },
        },
      });
      res.status(200).json({ "Lab results": labResults });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      }
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
  // Fetch lab results for the authenticated user (doctor or patient)
	static async getMyLabResults(req: Request, res: Response): Promise<void> {
	  try {
		console.log("Inside the getMyLabResults method");

		const session = req.session as CustomSessionData; // Cast session to CustomSessionData
		const userId = Number(session.user?.id); // Get the user ID from the session
		const userRole = session.user?.role; // Get the user's role

		if (!userId) {
		  throw new Error("Unauthorized: No user ID found in session");
		}

		let labResults = null;
		labResults = await prisma.labResult.findMany({
				where:{
					
				}
			})

		console.log("Lab results with patient data:", labResultsWithPatientData);
		res.status(200).json({ labResults: labResultsWithPatientData });
	  } catch (error) {
		console.error("Error in getMyLabResults:", error);
		if (error instanceof Error) {
		  if (error.message === "Unauthorized: No user ID found in session") {
			res.status(401).json({ error: error.message });
		  } else {
			res.status(500).json({ error: "Internal server error" });
		  }
		}
	  }
	}
}
export default LabController;
