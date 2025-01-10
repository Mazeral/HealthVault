import express from "express";
import prisma from "../utils/prisma";
const dashboardRouter = express.Router();
import { serializeBigInt } from "../utils/serializeBigInt";
dashboardRouter.get("/", async (req, res) => {
  try {
    // Fetch counts
    const totalPatients = await prisma.patient.count();
    const totalMedicalRecords = await prisma.medicalRecord.count();
    const totalPrescriptions = await prisma.prescription.count();
    const totalLabResults = await prisma.labResult.count();

    // Fetch recent patients
    const recentPatients = await prisma.patient.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    // Fetch recent lab results
    const recentLabResults = await prisma.labResult.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      metrics: [
        { title: "Total Patients", value: totalPatients },
        { title: "Total Medical Records", value: totalMedicalRecords },
        { title: "Total Prescriptions", value: totalPrescriptions },
        { title: "Total Lab Results", value: totalLabResults },
      ],
      recentPatients,
      recentLabResults,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

// New endpoint for patients per day
// Endpoint to fetch patients per day

// Endpoint to fetch patients per day using Prisma API
dashboardRouter.get("/patients-per-day", async (req, res) => {
  try {
    // Fetch patients grouped by creation date
    const patientsPerDay = await prisma.patient.groupBy({
      by: ["createdAt"], // Group by the createdAt field
      _count: {
        _all: true, // Count the number of patients per day
      },
      orderBy: {
        createdAt: "desc", // Order by creation date in descending order
      },
      take: 7, // Limit to the last 7 days
    });

    // Format the response
    const formattedResponse = patientsPerDay.map((group) => ({
      date: group.createdAt.toISOString().split("T")[0], // Extract the date part (YYYY-MM-DD)
      count: group._count._all, // Get the count of patients
    }));

    // Serialize the response to handle BigInt values (if necessary)
    const serializedResponse = serializeBigInt({
      patientsPerDay: formattedResponse,
    });

    res.status(200).json(serializedResponse);
  } catch (error) {
    console.error("Error fetching patients per day:", error);
    res.status(500).json({ error: "Failed to fetch patients per day data" });
  }
});
export default dashboardRouter;
