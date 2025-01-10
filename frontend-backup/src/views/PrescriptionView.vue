<template>
  <v-container>
    <v-card>
      <v-card-title>Prescriptions</v-card-title>
      <v-card-text>
        <!-- Form to create a new prescription -->
        <v-form @submit.prevent="createPrescription">
          <v-text-field v-model="newPrescription.patientId" label="Patient ID" type="number" required></v-text-field>
          <v-text-field v-model="newPrescription.medication" label="Medication" required></v-text-field>
          <v-text-field v-model="newPrescription.dosage" label="Dosage" required></v-text-field>
          <v-textarea v-model="newPrescription.instructions" label="Instructions"></v-textarea>
          <v-btn type="submit" color="primary">Create Prescription</v-btn>
        </v-form>

        <!-- Table to display all prescriptions -->
        <v-table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient ID</th>
              <th>Medication</th>
              <th>Dosage</th>
              <th>Instructions</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="prescription in prescriptions" :key="prescription.id">
              <td>{{ prescription.id }}</td>
              <td>{{ prescription.patientId }}</td>
              <td>{{ prescription.medication }}</td>
              <td>{{ prescription.dosage }}</td>
              <td>{{ prescription.instructions }}</td>
              <td>
                <v-btn @click="editPrescription(prescription)" color="warning">Edit</v-btn>
                <v-btn @click="deletePrescription(prescription.id)" color="error">Delete</v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>

        <!-- Dialog for editing a prescription -->
        <v-dialog v-model="editDialog" max-width="500">
          <v-card>
            <v-card-title>Edit Prescription</v-card-title>
            <v-card-text>
              <v-form @submit.prevent="updatePrescription">
                <v-text-field v-model="editPrescriptionData.patientId" label="Patient ID" type="number" required></v-text-field>
                <v-text-field v-model="editPrescriptionData.medication" label="Medication" required></v-text-field>
                <v-text-field v-model="editPrescriptionData.dosage" label="Dosage" required></v-text-field>
                <v-textarea v-model="editPrescriptionData.instructions" label="Instructions"></v-textarea>
                <v-btn type="submit" color="primary">Update</v-btn>
                <v-btn @click="editDialog = false" color="secondary">Cancel</v-btn>
              </v-form>
            </v-card-text>
          </v-card>
        </v-dialog>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../utils/api';

// Data for creating a new prescription
const newPrescription = ref({
  patientId: null,
  medication: '',
  dosage: '',
  instructions: '',
});

// Data for editing a prescription
const editPrescriptionData = ref({
  id: null,
  patientId: null,
  medication: '',
  dosage: '',
  instructions: '',
});

// List of all prescriptions
const prescriptions = ref([]);

// Dialog state for editing
const editDialog = ref(false);

// Fetch all prescriptions on component mount
onMounted(() => {
  fetchPrescriptions();
});

// Fetch all prescriptions
const fetchPrescriptions = async () => {
  try {
    const response = await api.get('/prescriptions');
    prescriptions.value = response.data.prescriptions;
  } catch (error) {
    console.error('Failed to fetch prescriptions:', error);
  }
};

// Create a new prescription
const createPrescription = async () => {
  try {
    const response = await api.post('/prescriptions', newPrescription.value);
    prescriptions.value.push(response.data.prescription);
    newPrescription.value = { patientId: null, medication: '', dosage: '', instructions: '' }; // Reset form
  } catch (error) {
    console.error('Failed to create prescription:', error);
  }
};

// Open edit dialog with prescription data
const editPrescription = (prescription) => {
  editPrescriptionData.value = { ...prescription };
  editDialog.value = true;
};

// Update a prescription
const updatePrescription = async () => {
  try {
    const response = await api.put(`/prescriptions/${editPrescriptionData.value.id}`, editPrescriptionData.value);
    const index = prescriptions.value.findIndex((p) => p.id === editPrescriptionData.value.id);
    if (index !== -1) {
      prescriptions.value[index] = response.data.updated;
    }
    editDialog.value = false;
  } catch (error) {
    console.error('Failed to update prescription:', error);
  }
};

// Delete a prescription
const deletePrescription = async (id) => {
  try {
    await api.delete(`/prescriptions/${id}`);
    prescriptions.value = prescriptions.value.filter((p) => p.id !== id);
  } catch (error) {
    console.error('Failed to delete prescription:', error);
  }
};
</script>

<style scoped>
.v-table {
  margin-top: 20px;
}
</style>
