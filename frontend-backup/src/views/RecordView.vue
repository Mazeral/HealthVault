<template>
  <v-container>
    <v-card>
      <v-card-title>Medical Records</v-card-title>
      <v-card-text>
        <!-- Form to add a new medical record -->
        <v-form @submit.prevent="addMedicalRecord">
          <v-text-field v-model="newRecord.patientId" label="Patient ID" required></v-text-field>
          <v-text-field v-model="newRecord.diagnosis" label="Diagnosis" required></v-text-field>
          <v-textarea v-model="newRecord.notes" label="Notes"></v-textarea>
          <v-btn type="submit" color="primary">Add Medical Record</v-btn>
        </v-form>

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
                <v-btn @click="deleteMedicalRecord(record.id)" color="error">Delete</v-btn>
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
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../utils/api';

// Data for adding a new medical record
const newRecord = ref({
  patientId: null,
  diagnosis: '',
  notes: '',
});

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

// Add a new medical record
const addMedicalRecord = async () => {
  try {
    const response = await api.post('/medical-records', newRecord.value);
    medicalRecords.value.push(response.data.success);
    newRecord.value = { patientId: null, diagnosis: '', notes: '' }; // Reset form
  } catch (error) {
    console.error('Failed to add medical record:', error);
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

// Delete a medical record
const deleteMedicalRecord = async (id) => {
  try {
    await api.delete(`/medical-records/${id}`);
    medicalRecords.value = medicalRecords.value.filter((record) => record.id !== id);
  } catch (error) {
    console.error('Failed to delete medical record:', error);
  }
};
</script>

<style scoped>
.v-table {
  margin-top: 20px;
}
</style>
