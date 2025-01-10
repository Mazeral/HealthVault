import express from "express";
import prisma from "../utils/prisma";
const dashboardRouter = express.Router();
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
export default dashboardRouter;
