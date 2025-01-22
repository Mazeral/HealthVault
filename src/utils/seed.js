const { PrismaClient } = require("@prisma/client");
const { faker } = require("@faker-js/faker");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

// Constants for the number of samples
const NUM_USERS = 20;
const NUM_PATIENTS = 100;
const NUM_MEDICAL_RECORDS_PER_PATIENT = 3;
const NUM_PRESCRIPTIONS_PER_PATIENT = 3;
const NUM_LAB_RESULTS_PER_PATIENT = 3;

// Roles for users
const ROLES = ["ADMIN", "DOCTOR"];

// Function to hash passwords
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

// Function to create fake users
async function createUsers() {
  const users = [];

  // Create the admin user "mohamad"
  users.push({
    name: "mohamad",
    email: "mohamad@example.com",
    password: await hashPassword("0000"),
    role: "ADMIN",
    createdAt: new Date(),
  });

  // Create the doctor user "mamdoh"
  users.push({
    name: "mamdoh",
    email: "mamdoh@example.com",
    password: await hashPassword("0000"),
    role: "DOCTOR",
    createdAt: new Date(),
  });

  // Create additional fake users
  for (let i = 0; i < NUM_USERS - 2; i++) {
    users.push({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: await hashPassword(faker.internet.password()),
      role: ROLES[Math.floor(Math.random() * ROLES.length)],
      createdAt: faker.date.past(),
    });
  }

  return await prisma.user.createMany({ data: users });
}

// Function to create fake patients
async function createPatients(users) {
  const patients = [];
  const doctor = users.find((user) => user.name === "mamdoh"); // Get the doctor "mamdoh"

  for (let i = 0; i < NUM_PATIENTS; i++) {
    patients.push({
      fullName: faker.person.fullName(),
      dateOfBirth: faker.date.birthdate({ min: 18, max: 90, mode: "age" }),
      phone: faker.phone.number(),
      email: faker.internet.email(),
      address: faker.location.streetAddress(),
      sex: faker.helpers.arrayElement(["MALE", "FEMALE"]),
      bloodGroup: faker.helpers.arrayElement([
        "A_PLUS",
        "A_MINUS",
        "B_PLUS",
        "B_MINUS",
        "AB_PLUS",
        "AB_MINUS",
        "O_PLUS",
        "O_MINUS",
      ]),
      userId: doctor.id, // Associate all patients with the doctor "mamdoh"
      createdAt: faker.date.past(),
    });
  }
  return await prisma.patient.createMany({ data: patients });
}

// Function to create fake medical records for patients
async function createMedicalRecords(patients) {
  const medicalRecords = [];
  for (const patient of patients) {
    for (let j = 0; j < NUM_MEDICAL_RECORDS_PER_PATIENT; j++) {
      medicalRecords.push({
        patientId: patient.id,
        diagnosis: faker.lorem.words(5),
        notes: faker.lorem.sentences(2),
        userId: patient.userId, // Associate with the doctor "mamdoh"
        createdAt: faker.date.past(),
      });
    }
  }
  return await prisma.medicalRecord.createMany({ data: medicalRecords });
}

// Function to create fake prescriptions for patients
async function createPrescriptions(patients) {
  const prescriptions = [];
  for (const patient of patients) {
    for (let k = 0; k < NUM_PRESCRIPTIONS_PER_PATIENT; k++) {
      prescriptions.push({
        patientId: patient.id,
        medication: faker.lorem.word(),
        dosage: `${Math.floor(Math.random() * 100)} mg`,
        instructions: faker.lorem.sentence(),
        userId: patient.userId, // Associate with the doctor "mamdoh"
        prescribedAt: faker.date.past(),
      });
    }
  }
  return await prisma.prescription.createMany({ data: prescriptions });
}

// Function to create fake lab results for patients
async function createLabResults(patients) {
  const labResults = [];
  for (const patient of patients) {
    for (let l = 0; l < NUM_LAB_RESULTS_PER_PATIENT; l++) {
      labResults.push({
        patientId: patient.id,
        testName: faker.lorem.words(2),
        result: faker.lorem.sentence(),
        notes: faker.lorem.sentences(2),
        userId: patient.userId, // Associate with the doctor "mamdoh"
        performedAt: faker.date.past(),
        createdAt: faker.date.past(),
      });
    }
  }
  return await prisma.labResult.createMany({ data: labResults });
}

// Main function to generate mock data
async function main() {
  try {
    console.log("Creating users...");
    await createUsers();
    console.log(`${NUM_USERS} users created.`);

    console.log("Fetching users...");
    const users = await prisma.user.findMany();

    console.log("Creating patients...");
    await createPatients(users);
    console.log(`${NUM_PATIENTS} patients created.`);

    console.log("Fetching patients...");
    const patients = await prisma.patient.findMany();

    console.log("Creating medical records...");
    await createMedicalRecords(patients);
    console.log(
      `${NUM_PATIENTS * NUM_MEDICAL_RECORDS_PER_PATIENT} medical records created.`,
    );

    console.log("Creating prescriptions...");
    await createPrescriptions(patients);
    console.log(
      `${NUM_PATIENTS * NUM_PRESCRIPTIONS_PER_PATIENT} prescriptions created.`,
    );

    console.log("Creating lab results...");
    await createLabResults(patients);
    console.log(
      `${NUM_PATIENTS * NUM_LAB_RESULTS_PER_PATIENT} lab results created.`,
    );

    console.log("Mock data generation completed successfully!");
  } catch (error) {
    console.error("Error generating mock data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the main function
main();
