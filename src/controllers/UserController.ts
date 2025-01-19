import prisma from "../utils/prisma";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import createObject from "../utils/utilFunctions";

class UserController {
  // Encrypts the password
  private async hashPassword(pwd: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(Number(process.env.SALT));
      const hash = await bcrypt.hash(pwd, salt);
      return hash;
    } catch (error) {
      throw new Error("Failed to hash password");
    }
  }

  // Creates a new user
  static async newUser(req: Request, res: Response) {
    try {
      const { name, email, password, role } = req.body;

      if (!email || !password || !role) {
        throw new Error("Missing required fields");
      }

      if (await prisma.user.findUnique({ where: { email } })) {
        throw new Error("Email already exists");
      }

      const hashedPassword = await new UserController().hashPassword(password);

      const result = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role,
        },
      });

      res.status(200).json({ newUser: result });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Missing required fields") {
          res.status(400).json({ error: error.message });
        } else if (error.message === "Email already exists") {
          res.status(409).json({ error: error.message });
        } else {
          res.status(500).json({ error: error.message });
        }
      }
    }
  }

  // Gets a user by ID
  static async getUser(req: Request, res: Response) {
    const { id } = req.params;

    try {
      if (!id) throw new Error("No ID provided");

      const user = await prisma.user.findUnique({
        where: { id: Number(id) },
        include: {
          patients: true,
          medicalRecords: true,
          prescriptions: true,
          labResults: true,
        },
      });

      if (!user) throw new Error("User not found");

      res.status(200).json({ user });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "No ID provided") {
          res.status(400).json({ error: error.message });
        } else if (error.message === "User not found") {
          res.status(404).json({ error: error.message });
        } else {
          res.status(500).json({ error: error.message });
        }
      }
    }
  }

  // Get all users
  static async allUsers(req: Request, res: Response) {
    try {
      const users = await prisma.user.findMany({
        include: {
          patients: true,
          medicalRecords: true,
          prescriptions: true,
          labResults: true,
        },
      });
      res.status(200).json({ users });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  }

  // Updates a user by ID
  static async updateUser(req: Request, res: Response) {
    const { id } = req.params;

    try {
      if (!id) throw new Error("No ID provided");

      const user = await prisma.user.findUnique({
        where: { id: Number(id) },
      });

      if (!user) throw new Error("User not found");

      const data = createObject({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
          ? await new UserController().hashPassword(req.body.password)
          : undefined,
        role: req.body.role,
      });

      const result = await prisma.user.update({
        where: { id: Number(id) },
        data,
      });

      res.status(200).json({ updated: result });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "No ID provided") {
          res.status(400).json({ error: error.message });
        } else if (error.message === "User not found") {
          res.status(404).json({ error: error.message });
        } else {
          res.status(500).json({ error: error.message });
        }
      }
    }
  }

  // Add a patient to the user
  static async addPatient(req: Request, res: Response) {
    const { id } = req.params;
    const { patientId } = req.body;

    try {
      if (!id || !patientId) throw new Error("Missing required fields");

      const user = await prisma.user.findUnique({
        where: { id: Number(id) },
      });

      if (!user) throw new Error("User not found");

      const updatedUser = await prisma.user.update({
        where: { id: Number(id) },
        data: {
          patients: {
            connect: { id: Number(patientId) },
          },
        },
        include: {
          patients: true,
        },
      });

      res.status(200).json({ updated: updatedUser });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Missing required fields") {
          res.status(400).json({ error: error.message });
        } else if (error.message === "User not found") {
          res.status(404).json({ error: error.message });
        } else {
          res.status(500).json({ error: error.message });
        }
      }
    }
  }

  // Delete a user
  static async deleteUser(req: Request, res: Response) {
    const { id } = req.params;

    try {
      if (!id) throw new Error("No ID provided");

      const result = await prisma.user.delete({
        where: { id: Number(id) },
      });

      res.status(200).json({ result });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "No ID provided") {
          res.status(400).json({ error: error.message });
        } else {
          res.status(500).json({ error: error.message });
        }
      }
    }
  }

  // Fetch all users with the DOCTOR role
  static async getAllDoctors(req: Request, res: Response) {
    try {
      const doctors = await prisma.user.findMany({
        where: { role: "DOCTOR" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      res.status(200).json({ doctors });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch doctors" });
    }
  }

  // Edit a DOCTOR user
  static async editDoctor(req: Request, res: Response) {
    const { id } = req.params;
    const { name, email } = req.body;

    try {
      if (!id || !name || !email) {
        throw new Error("Missing required fields");
      }

      const updatedDoctor = await prisma.user.update({
        where: { id: Number(id), role: "DOCTOR" },
        data: { name, email },
      });

      res.status(200).json({ updated: updatedDoctor });
    } catch (error) {
      res.status(500).json({ error: "Failed to update doctor" });
    }
  }

  // Delete a DOCTOR user
  static async deleteDoctor(req: Request, res: Response) {
    const { id } = req.params;

    try {
      if (!id) {
        throw new Error("Missing user ID");
      }

      await prisma.user.delete({
        where: { id: Number(id), role: "DOCTOR" },
      });

      res.status(200).json({ message: "Doctor deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete doctor" });
    }
  }

  // Fetch all patients for a specific doctor
  static async getMyPatients(req: Request, res: Response) {
    const { doctorId } = req.params;

    try {
      if (!doctorId) throw new Error("No doctor ID provided");

      const doctor = await prisma.user.findUnique({
        where: {
          id: Number(doctorId),
          role: "DOCTOR",
        },
        include: {
          patients: true,
        },
      });

      if (!doctor) throw new Error("Doctor not found");

      res.status(200).json({ patients: doctor.patients });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "No doctor ID provided") {
          res.status(400).json({ error: error.message });
        } else if (error.message === "Doctor not found") {
          res.status(404).json({ error: error.message });
        } else {
          res.status(500).json({ error: error.message });
        }
      }
    }
  }
}

export default UserController;
