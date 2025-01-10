<template>
  <v-container>
    <v-card>
      <v-card-title>Lab Results</v-card-title>
      <v-card-text>
        <!-- Form to create a new lab result -->
        <v-form @submit.prevent="createLabResult">
          <v-text-field v-model="newLabResult.patientId" label="Patient ID" required></v-text-field>
          <v-text-field v-model="newLabResult.testName" label="Test Name" required></v-text-field>
          <v-text-field v-model="newLabResult.result" label="Result" required></v-text-field>
          <v-text-field v-model="newLabResult.notes" label="Notes"></v-text-field>
          <v-text-field v-model="newLabResult.performedAt" label="Performed At" type="date" required></v-text-field>
          <v-btn type="submit" color="primary">Create Lab Result</v-btn>
        </v-form>

        <!-- Table to display all lab results -->
        <v-table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient ID</th>
              <th>Test Name</th>
              <th>Result</th>
              <th>Notes</th>
              <th>Performed At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="labResult in labResults" :key="labResult.id">
              <td>{{ labResult.id }}</td>
              <td>{{ labResult.patientId }}</td>
              <td>{{ labResult.testName }}</td>
              <td>{{ labResult.result }}</td>
              <td>{{ labResult.notes }}</td>
              <td>{{ labResult.performedAt }}</td>
              <td>
                <v-btn @click="editLabResult(labResult)" color="warning">Edit</v-btn>
                <v-btn @click="deleteLabResult(labResult.id)" color="error">Delete</v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>

        <!-- Dialog for editing a lab result -->
        <v-dialog v-model="editDialog" max-width="500">
          <v-card>
            <v-card-title>Edit Lab Result</v-card-title>
            <v-card-text>
              <v-form @submit.prevent="updateLabResult">
                <v-text-field v-model="editLabResultData.patientId" label="Patient ID" required></v-text-field>
                <v-text-field v-model="editLabResultData.testName" label="Test Name" required></v-text-field>
                <v-text-field v-model="editLabResultData.result" label="Result" required></v-text-field>
                <v-text-field v-model="editLabResultData.notes" label="Notes"></v-text-field>
                <v-text-field v-model="editLabResultData.performedAt" label="Performed At" type="date" required></v-text-field>
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

// Data for creating a new lab result
const newLabResult = ref({
  patientId: null,
  testName: '',
  result: '',
  notes: '',
  performedAt: '',
});

// Data for editing a lab result
const editLabResultData = ref({
  id: null,
  patientId: null,
  testName: '',
  result: '',
  notes: '',
  performedAt: '',
});

// List of all lab results
const labResults = ref([]);

// Dialog state for editing
const editDialog = ref(false);

// Fetch all lab results on component mount
onMounted(() => {
  fetchLabResults();
});

// Fetch all lab results
const fetchLabResults = async () => {
  try {
    const response = await api.get('/lab-results');
    labResults.value = response.data['Lab results'];
  } catch (error) {
    console.error('Failed to fetch lab results:', error);
  }
};

// Create a new lab result
const createLabResult = async () => {
  try {
    const response = await api.post('/lab-results', newLabResult.value);
    labResults.value.push(response.data['Lab result']);
    newLabResult.value = { patientId: null, testName: '', result: '', notes: '', performedAt: '' }; // Reset form
  } catch (error) {
    console.error('Failed to create lab result:', error);
  }
};

// Open edit dialog with lab result data
const editLabResult = (labResult) => {
  editLabResultData.value = { ...labResult };
  editDialog.value = true;
};

// Update a lab result
const updateLabResult = async () => {
  try {
    // Format performedAt as an ISO string
    const payload = {
      ...editLabResultData.value,
      performedAt: new Date(editLabResultData.value.performedAt).toISOString(),
    };

    const response = await api.put(`/lab-results/${editLabResultData.value.id}`, payload);
    const updatedResult = response.data.updated;
    const index = labResults.value.findIndex((result) => result.id === updatedResult.id);
    if (index !== -1) {
      labResults.value[index] = updatedResult;
    }
    editDialog.value = false;
  } catch (error) {
    console.error('Failed to update lab result:', error);
  }
};

// Delete a lab result
const deleteLabResult = async (id) => {
  try {
    await api.delete(`/lab-results/${id}`);
    labResults.value = labResults.value.filter((result) => result.id !== id);
  } catch (error) {
    console.error('Failed to delete lab result:', error);
  }
};
</script>

<style scoped>
.v-table {
  margin-top: 20px;
}
</style>
