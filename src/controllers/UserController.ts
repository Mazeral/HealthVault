import prisma from "../utils/prisma";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import createObject from "../utils/utilFunctions";
class UserController {
  // encrypts the password
  private async hashPassword(pwd: string) {
    try {
      const salt = await bcrypt.genSalt(Number(process.env.SALT));
      const hash = await bcrypt.hash(pwd, salt);
      return hash;
    } catch (error) {
      if (error instanceof Error) throw error;
    }
  }
  // creates a new user
  static async newUser(req: Request, res: Response) {
    try {
      const name = req.body.name || null;
      const email = req.body.email || null;
      let password = req.body.password || null;
      const role = req.body.role || null;
      const patients = req.body.patients || null;
      let result = null;
      if (!email || !password || !role) {
        throw Error(`Missing field`);
      }
      if (await prisma.user.findUnique({ where: { email: email } }))
        throw Error("Email exists");
      const hash = new UserController();
      password = await hash.hashPassword(password);
      if (patients !== null) {
        result = await prisma.user.create({
          data: {
            name: name,
            email: email,
            password: password,
            role: role,
            patients: {
              connect: patients.map((id: number) => ({ id })),
            },
          },
        });
      } else {
        result = await prisma.user.create({
          data: {
            name: name,
            email: email,
            password: password,
            role: role,
          },
        });
      }
      res.status(200).json({ "new user:": result });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Missing field")
          res.status(400).json({ error: error.message });
        else res.status(500).json({ error: error.message });
      }
    }
  }

  // Gets a user with id
  static async getUser(req: Request, res: Response) {
    const id = req.params.id || null;

    try {
      if (!id) throw Error("No id provided");

      const user = await prisma.user.findUnique({
        where: {
          id: Number(id),
        },
      });
      if (!user) throw Error("No user found");
      res.status(200).json({ user: user });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "No id provided")
          res.status(400).json({ error: error.message });
        else if (error.message === "No user found")
          res.status(404).json({ error: error.message });
        else res.status(500).json({ error: error.message });
      }
    }
  }

  // Get all users
  static async allUsers(req: Request, res: Response) {
    const users = await prisma.user.findMany();
    res.status(200).json({ users: users });
  }

  // Updates a user by id
  static async updateUser(req: Request, res: Response) {
    const id = req.params.id || null;

    try {
      if (!id) throw Error("No id provided");

      const user = await prisma.user.findUnique({
        where: {
          id: Number(id),
        },
      });
      if (!user) throw Error("No user found");

      const data = createObject({
        name: String(req.body.name),
        email: String(req.body.email),
        password: String(req.body.password),
        role: String(req.body.role),
        patients: req.body.patients,
      });

      const result = await prisma.user.updateMany({
        where: {
          id: Number(id),
        },
        data: data,
      });
      res.status(200).json({ updated: result });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "No id provided")
          res.status(400).json({ error: error.message });
        else if (error.message === "No user found")
          res.status(404).json({ error: error.message });
        else res.status(500).json({ error: error.message });
      }
    }
  }

  // Add a patient to the user
  static async addPatient(req: Request, res: Response) {
    // Adds a patient to the user
    try {
      const userId = req.params.id || null;
      const patientId = req.body.id || null;

      if (!patientId) throw Error("No patient id provided");
      const user = await prisma.user.findUnique({
        where: {
          id: Number(userId),
        },
      });
      if (!user) throw Error("No user found");

      const record = await prisma.user.update({
        where: {
          id: Number(userId),
        },
        data: {
          patients: {
            connect: {
              id: Number(patientId),
            },
          },
        },
      });
      res.status(200).json({ updated: record });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "No patient id provided")
          res.status(400).json({ error: error.message });
        else if (error.message === "No user found")
          res.status(404).json({ error: error.message });
        else res.status(500).json({ error: error.message });
      }
    }
  }

  // Delete a user
  static async deleteUser(req: Request, res: Response) {
    try {
      const userId = req.params.id || null;

      if (!userId) throw Error("No user ID");
      const result = await prisma.user.delete({
        where: {
          id: Number(userId),
        },
      });
      res.status(200).json({ result: result });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "No user ID")
          res.status(400).json({ error: error.message });
        else res.status(500).json({ error: error.message });
      }
    }
  }
  // Fetch all users with the DOCTOR role
  static async getAllDoctors(req: Request, res: Response) {
    try {
      const doctors = await prisma.user.findMany({
        where: {
          role: "DOCTOR",
        },
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
      console.error("Failed to fetch doctors:", error);
      res.status(500).json({ error: "Failed to fetch doctors" });
    }
  }

  // Edit a DOCTOR user
  static async editDoctor(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, email } = req.body;

      if (!id || !name || !email) {
        throw new Error("Missing required fields");
      }

      const updatedDoctor = await prisma.user.update({
        where: { id: Number(id), role: "DOCTOR" },
        data: { name, email },
      });

      res.status(200).json({ updated: updatedDoctor });
    } catch (error) {
      console.error("Failed to update doctor:", error);
      res.status(500).json({ error: "Failed to update doctor" });
    }
  }

  // Delete a DOCTOR user
  static async deleteDoctor(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        throw new Error("Missing user ID");
      }

      await prisma.user.delete({
        where: { id: Number(id), role: "DOCTOR" },
      });

      res.status(200).json({ message: "Doctor deleted successfully" });
    } catch (error) {
      console.error("Failed to delete doctor:", error);
      res.status(500).json({ error: "Failed to delete doctor" });
    }
  }
static async getMyPatients(req: Request, res: Response) {
  try {
    const doctorId = req.params.doctorId;

    if (!doctorId) throw Error("No doctor ID provided");

    const doctor = await prisma.user.findUnique({
      where: {
        id: Number(doctorId),
        role: "DOCTOR",
      },
      include: {
        patients: true,
      },
    });

    if (!doctor) throw Error("Doctor not found");

    res.status(200).json({ patients: doctor.patients });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "No doctor ID provided")
        res.status(400).json({ error: error.message });
      else if (error.message === "Doctor not found")
        res.status(404).json({ error: error.message });
      else res.status(500).json({ error: error.message });
    }
  }
}
}

export default UserController;
