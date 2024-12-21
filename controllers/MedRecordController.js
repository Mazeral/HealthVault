import { prisma } from '../utils/prisma';

class MedRecordController {
	static async updateMedRecord(req, res) {
		// Updates a medical record
		try {
			const patientId = req.params.id || null;

			if (!patientId) throw Error('No id provided');

			const patient = await prisma.patient.findUnique({
				where: {
					id: id,
				},
			});
			if (!patient) throw Error('No patient found');

			const allowedFields = ['diganosis', 'notes', 'patientId'];

			// Creates an object with key names and values
			const data = Object.fromEntries(
				Object.entries(req.body).filter(
					([key, value]) =>
						allowedFields.includes(key) && value !== undefined,
				),
			);

			const updates = await prisma.medicalrecord.updateMany({
				where: {
					id: id,
				},
				data: data,
			});
			if (data.patientId) {
				await prisma.medicalrecord.update({
					where: {
						id: id,
					},
					// Links the id of the record to the id of the patientId
					connect: {
						patient: {
							id: data.patientId,
						},
					},
				});
			}
			res.status(200).json({ updated: updates });
		} catch (error) {
			if (error.message === 'No id provided')
				res.status(400).json({ error: error.message });
			else if (error.message === 'No patient found')
				res.status(404).json({ error: error.message });
			else res.status(500).json({ error: error.message });
		}
	}

	// Fetch a medical record of a patient from the database
	static async getMedRecord(req, res) {
		try {
			const id = req.params.id || null;

			if (!id) throw Error('No id provided');

			const medRecord = await prisma.medicalrecord.findUnique({
				where: {
					id: id,
				},
			});
			if (!medHistory) throw Error('Medical record not found');
			else res.status(200).json({ 'Medical Record': medRecord });
		} catch (error) {
			if (error.message === 'No id provided')
				res.status(400).json({ error: error.message });
			else if (error.message === 'Medical record not found')
				res.status(404).json({ error: error.message });
			else res.status(500).json({ error: error.message });
		}
	}

	// Delete a medical record from the database
	static async deleteRecord(req, res) {
		try {
			const id = req.params.id || null;

			if (!id) throw Error('No id provided');
			const deleteRecord = await prisma.medicalrecord.delete({
				where: {
					id: id,
				},
			});
			res.status(200).json({ message: deleteRecord });
		} catch (error) {
			if (error.message === 'No id provided')
				res.status(400).json({ error: error.message });
			else res.status(500).json({ error: error.message });
		}
	}
}

export default MedRecordController;
