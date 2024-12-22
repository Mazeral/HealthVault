import prisma from "../utils/prisma";
import bcrypt from 'bcrypt';
class UserController {
	// encrypts the password
	async #hashpwd(pwd){
		try {
			const salt = await bcrypt.genSalt(process.env.SALT)
			const hash = await bcrypt.hash(pwd, salt)
			return hash
			
		} catch (error) {
			throw error
		}
	}
	// creates a new user
	static async newUser(req, res) {
		const email = req.body.email || null;
		const password = req.body.password || null;
		const role = req.body.role || null;
		const patients = req.body.patients || null;
		try {
			if (!email || !password || !role) {
				throw Error(`Missing field`);
			}
			password = await this.#hashpwd(password)
			const result = await prisma.user.create({
				data: {
					email: firstName,
					password: lastName,
					role: new Date(dateOfBirth),
					patients: {
						connect:{
							patients
						}
					},
				},
			});
			res.status(200).json({ 'new user:': result });
		} catch (error) {
			if (error.message === 'Missing field')
				res.status(400).json({ error: error.message });
			else res.status(500).json({ error: error.message });
		}
	}

	// Gets a user with id
	static async getUser(req, res) {
		const id = req.params.id || null;

		try {
			if (!id) throw Error('No id provided');

			const user = await prisma.user.findUnique({
				where: {
					id: id,
				},
			});
			if (!patient) throw Error('No user found');
			res.status(200).json({ user: user });
		} catch (error) {
			if (error.message === 'No id provided')
				res.status(400).json({ error: error.message });
			else if (error.message === 'No user found')
				res.status(404).json({ error: error.message });
			else res.status(500).json({ error: error.message });
		}
	}

	// Get all users
	static async allUsers(req, res){
		const users = await prisma.user.findMany()
		res.status(200).json({"users": users})
	}

	// Updates a user by id
	static async updateUser(req, res) {
		const id = req.params.id || null;

		try {
			if (!id) throw Error('No id provided');

			const user = await prisma.user.findUnique({
				where: {
					id: id,
				},
			});
			if (!user) throw Error('No user found');

			const allowedFields = [
				'email',
				'password',
				'role',
				'patients',
			];

			const data = Object.fromEntries(
				Object.entries(req.body).filter(
					([key, value]) =>
						allowedFields.includes(key) && value !== undefined,
				),
			);

			const result = await prisma.user.updateMany({
				where: {
					id: id,
				},
				data: data,
			});
			res.status(200).json({ updated: result });
		} catch (error) {
			if (error.message === 'No id provided')
				res.status(400).json({ error: error.message });
			else if (error.message === 'No user found')
				res.status(404).json({ error: error.message });
			else res.status(500).json({ error: error.message });
		}
	}

	// Add a patient to the user
	static async addPatient(req, res) {
		// Adds a patient to the user
		try {
			const userId = req.params.id || null;
			const patientId = req.body.id || null;

			if (!patientId) throw Error('No patient id provided');
			const user = await prisma.user.findUnique({
				where: {
					id: userId,
				},
			});
			if (!user) throw Error('No user found');

			const record = await prisma.user.update({
				where:{
					id: userId
				},
				patient: {
					connect: {
						id: patientId,
					},
				},
			});
			res.status(200).json({ updated: record });
		} catch (error) {
			if (error.message === 'No patient id provided')
				res.status(400).json({ error: error.message });
			else if (error.message === 'No user found')
				res.status(404).json({ error: error.message });
			else res.status(500).json({ error: error.message });
		}
	}

	// Delete a user
	static async deleteUser(req, res){
		try {
			const userId = req.params.id || null;
			
			if (!userId) throw Error("No user ID")
			const result = await prisma.user.delete({
				where:{
					id: userId
				}
			})
			res.status(200).json({"result": result})
		} catch (error) {
			if (error.message === "No user ID") res.status(400).json({"error": error.message})
			else res.status(500).json({"error": error.message})
		}
	}

}

export default UserController;
