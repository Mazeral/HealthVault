import PatientController from "../controllers/PatientController"
import prismaMock from "../singleton"

describe("Test PatientController", ()=>{
	it("Should update the patient data", async () => {
		const patient = {
			id: 1,
			firstName: "John",
			lastName: "Doe",
			dateOfBirth: new Date("1981-1-1"),
			phone:null,
			email: null,
			address: null,
			createdAt: Date.now(),
			updatedAt: Date.now()
		}

		const body = {
			firstName: "Jenny",
			phone: "12345"
		}

		const allowedFields = [
			'firstName',
			'lastName',
			'dateOfBirth',
			'phone',
			'email',
			'address',
		];
		const data = Object.fromEntries(
			Object.entries(body).filter(([key]) =>
				allowedFields.includes(key),
			),
		);

		data.dateOfBirth = new Date(data.dateOfBirth);
		const result = await prismaMock.patient.updateMany.mockResolvedValue({
			where: {
				id: 1,
			},
			data: data,
		});
		expect(PatientController.updatePatient(patient)).toMatch(patient)
	})
})

