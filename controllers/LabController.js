import prisma from "../utils/prisma"
class LabController{

	// Create a lab result for a patient
	static async newLabResult(req, res) {
		const patientId = req.body.patientId || null;
		const testName = req.body.testName || null;
		const result = req.body.result || null;
		const notes = req.body.notes || null;
		const performedAt = req.body.performedAt || null;

		try {
			if (!testName) throw Error('No test Name provided');
			if (!result) throw Error('No result provided');
			if (!performedAt) throw Error('No performed At provided');
		if(!patientId) throw Error("No patient ID provided")

			const labResult = await prisma.labResult.create({
				data: {
					patientId: patientId,
					testName: testName,
					result: result,
					notes: notes,
					performedAt: performedAt,
					patient:{
						connect: {
							id: patientId,
						},
					}
				},
			});
			res.status(200).json({ "Lab result": labResult });
		} catch (error) {
			if (
				error.message === 'No test name provided' ||
				error.message === 'No patient ID provided' ||
				error.message === 'No result provided' ||
				error.message === 'No performed At provided'
			)
				res.status(400).json({ error: error.message });
			else res.status(500).json({ error: error.message });
		}
	}

	// Fetch a lab result by id
	static async getLabResult(req, res) {
		try {
			const labResultId = req.params.id;

			if (!labResultId) throw Error('No lab result ID provided');

			const labResult = await prisma.labResult.findUnique({
				where: {
					id: labResultId,
				},
			});

			res.status(200).json({ "Lab result": labResult });
		} catch (error) {
			if (error.message === 'No prescription ID provided')
				res.status(400).json({ error: error.message });
			else res.status(500).json({ error: error.message });
		}
	}

	// gets all the lab results from the database
	static async allLabResults(req, res) {
		try {
			const labResults = await prisma.labResult.findMany();
			res.status(200).json({ "Lab results": labResults });
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}

	// update a lab result
	static async updateLabResult(req, res) {
		try {
			const labResultId = req.params.id;

			if (!labResultId) throw Error('Lab test ID not provided');
			const allowedFields = [
				'patientId',
				'testName',
				'result',
				'notes',
				'performedAt',
			];

			const data = Object.fromEntries(
				Object.entries(req.body).filter(
					([key, value]) =>
						allowedFields.includes(key) && value !== undefined,
				),
			);

			const updates = await prisma.labResult.updateMany({
				where: {
					id: labResultId,
				},
				data: data,
			});
			if (data.patientId)
				await prisma.labResult.update({
					where: {
						id: labResultId,
					},
					patient: {
						connect: {
							id: patientId,
						},
					},
				});
			res.status(200).json({ updated: updates });
		} catch (error) {
			if (error.message === 'Lab test ID not provided')
				res.status(400).json({ error: error.message });
			else res.status(500).json({ error: error.message });
		}
	}

	// Delete a lab result
	static async deleteLabResult(req, res) {
		try {
			const labResultId = req.params.id || null;

			const result = await prisma.labResult.delete({
				where: {
					id: labResultId,
				},
			});
			res.status(200).json({ result: result });
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}
}
export default LabController
