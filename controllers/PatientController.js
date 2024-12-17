import { prisma } from '../utils/prisma';

class PatientController {
	// creates a patient without health records
	static async newPatient(req, res) {
		const firstName = req.body.firstName ? req.body.firstName : null;
		const lastName = req.body.lastName ? req.body.lastName : null;
		const dateOfBirth = req.body.dateOfBirth ? req.body.dateOfBirth : null;
		const phone = req.body.phone ? req.body.phone : null;
		const email = req.body.email ? req.body.email : null;
		const address = req.body.phone ? req.body.address : null;
		try {
			if (!firstName || !lastName) {
				throw Error(`Missing name field`);
			}
			const result = await prisma.patient.create({
				data: {
					firstName: firstName,
					lastName: lastName,
					dateOfBirth: new Date(dateOfBirth),
					phone: phone,
					email: email,
					address: address,
				},
			});
			res.status(200).json({ 'Patient data:': result });
		} catch (error) {
			if (error.message === 'Missing name field')
				res.status(400).json({ error: error.message });
			else res.status(500).json({ error: error.message });
		}
	}

	// Gets a patient with id
	static async getPatient(req, res) {
		const id = req.params.id ? req.params.id : null;

		try {
			if (!id) throw Error('No id provided');

			const patient = await prisma.patient.findUnique({
				where: {
					id: id,
				},
			});
			if (!patient) throw Error('No patient found');
			res.status(200).json({ patient: patient });
		} catch (error) {
			if (error.message === 'No id provided')
				res.status(400).json({ error: error.message });
			else if (error.message === 'No patient found')
				res.status(404).json({ error: error.message });
			else res.status(500).json({ error: error.message });
		}
	}

	// Updates a patient by id
	static async updatePatient(req, res) {
		const id = req.params.id ? req.params.id : null;

		try {
			if (!id) throw Error('No id provided');

			const patient = await prisma.patient.findUnique({
				where: {
					id: id,
				},
			});
			if (!patient) throw Error('No patient found');

			const allowedFields = [
				'firstName',
				'lastName',
				'dateOfBirth',
				'phone',
				'email',
				'address',
			];
			const data = Object.fromEntries(
				Object.entries(req.body).filter(([key]) =>
					allowedFields.includes(key),
				),
			);

			data.dateOfBirth = new Date(data.dateOfBirth);
			const result = await prisma.yourModel.updateMany({
				where: {
					id: id,
				},
				data: data,
			});
			res.status(200).json({ updated: result });
		} catch (error) {
			if (error.message === 'No id provided')
				res.status(400).json({ error: error.message });
			else if (error.message === 'No patient found')
				res.status(404).json({ error: error.message });
			else res.status(500).json({ error: error.message });
		}
	}
}

export default PatientController;
