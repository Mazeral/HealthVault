import prisma from '../utils/prisma';

class PrescriptionController {
	// Create a prescription for a patient
	static async newPrescription(req, res) {
		const patientId = req.body.patientId || null;
		const medication = req.body.medication || null;
		const dosage = req.body.dosage || null;
		const instructions = req.body.instructions || null;

		try {
			if (!patientId) throw Error('No patientId provided');
			if (!medication) throw Error('No medication provided');
			if (!dosage) throw Error('No dosage provided');

			const prescription = await prisma.prescription.create({
				data: {
					patientId: patientId,
					medication: medication,
					dosage: dosage,
					instructions: instructions,
					patient:{
						connect: {
							id: patientId,
						},
					}
				},
			});
			res.status(200).json({ prescription: prescription });
		} catch (error) {
			if (
				error.message === 'No id provided' ||
				error.message === 'No patientId provided' ||
				error.message === 'No medication provided' ||
				error.message === 'No dosage provided'
			)
				res.status(400).json({ error: error.message });
			else res.status(500).json({ error: error.message });
		}
	}

	// Fetch a prescription by id
	static async getPrescription(req, res) {
		try {
			const prescId = req.params.id;

			if (!prescId) throw Error('No prescription ID provided');

			const prescription = await prisma.prescription.findUnique({
				where: {
					id: prescId,
				},
			});

			res.status(200).json({ prescription: prescription });
		} catch (error) {
			if (error.message === 'No prescription ID provided')
				res.status(400).json({ error: error.message });
			else res.status(500).json({ error: error.message });
		}
	}

	// gets all the prescriptions from the database
	static async allPrescriptions(req, res) {
		try {
			const prescriptions = await prisma.prescription.findMany();
			res.status(200).json({ prescriptions: prescriptions });
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}

	// update a prescription
	static async updatePrescription(req, res) {
		try {
			const prescId = req.params.id;

			if (!prescId) throw Error('Prescription ID not provided');
			const allowedFields = [
				'patientId',
				'medication',
				'dosage',
				'instructions',
			];

			const data = Object.fromEntries(
				Object.entries(req.body).filter(
					([key, value]) =>
						allowedFields.includes(key) && value !== undefined,
				),
			);

			const updates = await prisma.prescription.updateMany({
				where: {
					id: prescId,
				},
				data: data,
			});
			if (data.patientId)
				await prisma.prescription.update({
					where: {
						id: prescId,
					},
					patient: {
						connect: {
							id: patientId,
						},
					},
				});
			res.status(200).json({ updated: updates });
		} catch (error) {
			if (error.message === 'Prescription ID not provided')
				res.status(400).json({ error: error.message });
			else res.status(500).json({ error: error.message });
		}
	}

	// Delete a prescription
	static async deletePrescription(req, res) {
		try {
			const prescId = req.params.id || null;

			const result = await prisma.prescription.delete({
				where: {
					id: prescId,
				},
			});
			res.status(200).json({ result: result });
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}
}

export default PrescriptionController;
