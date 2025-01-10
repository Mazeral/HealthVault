const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const csv = require("csv-parser");

const prisma = new PrismaClient();

fs.createReadStream("/home/mohammad/Downloads/pre_mcok.csv")
  .pipe(csv())
  .on("data", async (row) => {
    // Ensure patientId is an integer
    const patientId = parseInt(row.patientId, 10);

    // Check if the patientId exists in the Patient table
    const patientExists = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patientExists) {
      console.warn(
        `Patient with ID ${patientId} does not exist. Skipping this record.`,
      );
      return; // Skip this record
    }

    // Validate prescribedAt date
    const prescribedAt = new Date(row.prescribedAt);
    if (isNaN(prescribedAt.getTime())) {
      console.warn(
        `Invalid date for prescribedAt: ${row.prescribedAt}. Skipping this record.`,
      );
      return; // Skip this record
    }

    await prisma.prescription.create({
      data: {
        medication: row.medication,
        dosage: row.dosage,
        instructions: row.instructions || null, // Set to null if instructions are not provided
        prescribedAt: prescribedAt, // Use the validated Date object
        patient: {
          connect: { id: patientId }, // Link to an existing Patient
        },
      },
    });
  })
  .on("end", () => {
    console.log("CSV file successfully processed");
    prisma.$disconnect();
  });
