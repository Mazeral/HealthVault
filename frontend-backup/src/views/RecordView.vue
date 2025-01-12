<template>
  <v-container>
    <v-card>
      <v-card-title>Medical Records</v-card-title>
      <v-card-text>
        <!-- Button to navigate to the new medical record view -->
        <v-btn @click="navigateToNewMedicalRecord" color="primary" class="mb-4">New Medical Record</v-btn>

        <!-- Table to display all medical records -->
        <v-table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient ID</th>
              <th>Diagnosis</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in medicalRecords" :key="record.id">
              <td>{{ record.id }}</td>
              <td>{{ record.patientId }}</td>
              <td>{{ record.diagnosis }}</td>
              <td>{{ record.notes }}</td>
              <td>
                <v-btn @click="editMedicalRecord(record)" color="warning">Edit</v-btn>
                <v-btn @click="confirmDelete(record)" color="error">Delete</v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>

        <!-- Dialog for editing a medical record -->
        <v-dialog v-model="editDialog" max-width="500">
          <v-card>
            <v-card-title>Edit Medical Record</v-card-title>
            <v-card-text>
              <v-form @submit.prevent="updateMedicalRecord">
                <v-text-field v-model="editRecordData.patientId" label="Patient ID" required></v-text-field>
                <v-text-field v-model="editRecordData.diagnosis" label="Diagnosis" required></v-text-field>
                <v-textarea v-model="editRecordData.notes" label="Notes"></v-textarea>
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
              You are about to delete the medical record for patient ID: <strong>{{ recordToDelete?.patientId }}</strong>. This action cannot be undone.
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="secondary" @click="deleteDialog = false">Cancel</v-btn>
              <v-btn color="error" @click="deleteMedicalRecordConfirmed">Delete</v-btn>
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

// Data for editing a medical record
const editRecordData = ref({
  id: null,
  patientId: null,
  diagnosis: '',
  notes: '',
});

// List of all medical records
const medicalRecords = ref([]);

// Dialog state for editing
const editDialog = ref(false);

// Confirmation dialog state for deletion
const deleteDialog = ref(false);
const recordToDelete = ref(null); // Stores the medical record to be deleted

// Fetch all medical records on component mount
onMounted(() => {
  fetchMedicalRecords();
});

// Fetch all medical records
const fetchMedicalRecords = async () => {
  try {
    const response = await api.get('/medical-records');
    medicalRecords.value = response.data['Medical Records'];
  } catch (error) {
    console.error('Failed to fetch medical records:', error);
  }
};

// Open edit dialog with medical record data
const editMedicalRecord = (record) => {
  editRecordData.value = { ...record };
  editDialog.value = true;
};

// Update a medical record
const updateMedicalRecord = async () => {
  try {
    const response = await api.put(`/medical-records/${editRecordData.value.id}`, editRecordData.value);
    const updatedRecord = response.data.updated;
    const index = medicalRecords.value.findIndex((record) => record.id === updatedRecord.id);
    if (index !== -1) {
      medicalRecords.value[index] = updatedRecord;
    }
    editDialog.value = false;
  } catch (error) {
    console.error('Failed to update medical record:', error);
  }
};

// Open confirmation dialog for deletion
const confirmDelete = (record) => {
  recordToDelete.value = record;
  deleteDialog.value = true;
};

// Delete a medical record after confirmation
const deleteMedicalRecordConfirmed = async () => {
  try {
    await api.delete(`/medical-records/${recordToDelete.value.id}`);
    medicalRecords.value = medicalRecords.value.filter((record) => record.id !== recordToDelete.value.id);
  } catch (error) {
    console.error('Failed to delete medical record:', error);
  } finally {
    deleteDialog.value = false; // Close the dialog
  }
};

// Navigate to the new medical record view
const navigateToNewMedicalRecord = () => {
  router.push({ name: 'new-medical-record' });
};
</script>

<style scoped>
.v-table {
  margin-top: 20px;
}
</style>
