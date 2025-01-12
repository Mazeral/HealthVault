<template>
  <v-container>
    <v-card>
      <v-card-title>Prescriptions</v-card-title>
      <v-card-text>
        <!-- Button to navigate to the new prescription view -->
        <v-btn @click="navigateToNewPrescription" color="primary" class="mb-4">New Prescription</v-btn>

        <!-- Table to display all prescriptions -->
        <v-table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient Full Name</th>
              <th>Medication</th>
              <th>Dosage</th>
              <th>Instructions</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="prescription in prescriptions" :key="prescription.id">
              <td>{{ prescription.id }}</td>
              <td>{{ prescription.patient.fullName }}</td>
              <td>{{ prescription.medication }}</td>
              <td>{{ prescription.dosage }}</td>
              <td>{{ prescription.instructions }}</td>
              <td>
                <v-btn @click="editPrescription(prescription)" color="warning">Edit</v-btn>
                <v-btn @click="confirmDelete(prescription)" color="error">Delete</v-btn>
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

        <!-- Confirmation Dialog for Deletion -->
        <v-dialog v-model="deleteDialog" max-width="400">
          <v-card>
            <v-card-title class="headline">Are you sure?</v-card-title>
            <v-card-text>
              You are about to delete the prescription for patient: <strong>{{ prescriptionToDelete?.patient.fullName }}</strong>. This action cannot be undone.
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="secondary" @click="deleteDialog = false">Cancel</v-btn>
              <v-btn color="error" @click="deletePrescriptionConfirmed">Delete</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../utils/api';

const router = useRouter();

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

// Confirmation dialog state for deletion
const deleteDialog = ref(false);
const prescriptionToDelete = ref(null); // Stores the prescription to be deleted

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

// Open confirmation dialog for deletion
const confirmDelete = (prescription) => {
  prescriptionToDelete.value = prescription;
  deleteDialog.value = true;
};

// Delete a prescription after confirmation
const deletePrescriptionConfirmed = async () => {
  try {
    await api.delete(`/prescriptions/${prescriptionToDelete.value.id}`);
    prescriptions.value = prescriptions.value.filter((p) => p.id !== prescriptionToDelete.value.id);
  } catch (error) {
    console.error('Failed to delete prescription:', error);
  } finally {
    deleteDialog.value = false; // Close the dialog
  }
};

// Navigate to the new prescription view
const navigateToNewPrescription = () => {
  router.push({ name: 'new-prescription' });
};
</script>

<style scoped>
.v-table {
  margin-top: 20px;
}
</style>
