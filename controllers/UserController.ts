import prisma from "../utils/prisma";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import createObject from "../utils/utilFunctions";
class UserController {
  // encrypts the password
  private async hashPassword(pwd: string) {
    try {
      const salt = await bcrypt.genSalt(process.env.SALT);
      const hash = await bcrypt.hash(pwd, salt);
      return hash;
    } catch (error) {
      throw error;
    }
  }
  // creates a new user
  static async newUser(req, res) {
    try {
      const email = req.body.email || null;
      let password = req.body.password || null;
      const role = req.body.role || null;
      const patients = req.body.patients || null;
      if (!email || !password || !role) {
        throw Error(`Missing field`);
      }
      const hash = new UserController();
      password = await hash.hashPassword(password);
      const result = await prisma.user.create({
        data: {
          email: email,
          password: password,
          role: role,
          patients: {
            connect: {
              patients,
            },
          },
        },
      });
      res.status(200).json({ "new user:": result });
    } catch (error) {
      if (error.message === "Missing field")
        res.status(400).json({ error: error.message });
      else res.status(500).json({ error: error.message });
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
      if (error.message === "No id provided")
        res.status(400).json({ error: error.message });
      else if (error.message === "No user found")
        res.status(404).json({ error: error.message });
      else res.status(500).json({ error: error.message });
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
      if (error.message === "No id provided")
        res.status(400).json({ error: error.message });
      else if (error.message === "No user found")
        res.status(404).json({ error: error.message });
      else res.status(500).json({ error: error.message });
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
      if (error.message === "No patient id provided")
        res.status(400).json({ error: error.message });
      else if (error.message === "No user found")
        res.status(404).json({ error: error.message });
      else res.status(500).json({ error: error.message });
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
      if (error.message === "No user ID")
        res.status(400).json({ error: error.message });
      else res.status(500).json({ error: error.message });
    }
  }
}

export default UserController;