<template>
  <v-container>
    <v-card>
      <v-card-title>My Lab Results</v-card-title>
      <v-card-text>
        <!-- Search Bar -->
        <v-row class="mt-4">
          <v-col cols="12" md="6">
            <v-text-field
              v-model="searchQuery"
              label="Search by Test Name"
              outlined
              dense
              @keyup.enter="handleSearch"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-btn color="primary" @click="openNewLabResultDialog">New Lab Result</v-btn>
            <v-btn color="secondary" @click="handleSearch" class="ml-2">Search</v-btn>
          </v-col>
        </v-row>

        <!-- Lab Results Table -->
<v-data-table
  :headers="headers"
  :items="filteredLabResults"
  :items-per-page="itemsPerPage"
  :page.sync="currentPage"
  :loading="loading"
  loading-text="Loading... Please wait"
  hide-default-footer
>
  <template v-slot:item.testName="{ item }">
    {{ item.testName }}
  </template>
  <template v-slot:item.result="{ item }">
    {{ item.result }}
  </template>
  <template v-slot:item.notes="{ item }">
    {{ item.notes }}
  </template>
  <template v-slot:item.performedAt="{ item }">
    {{ formatDate(item.performedAt) }}
  </template>
  <template v-slot:item.patientFullName="{ item }">
    {{ item.patientFullName }}
  </template>
  <template v-slot:no-data>
    <v-alert type="info">No data available</v-alert>
  </template>
</v-data-table>

        <!-- Pagination Controls -->
        <v-row class="mt-4">
          <v-col cols="12">
            <v-pagination
              v-model="currentPage"
              :length="totalPages"
              :total-visible="7"
              @input="handlePageChange"
            ></v-pagination>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- New Lab Result Dialog -->
    <v-dialog v-model="newLabResultDialog" max-width="500">
      <v-card>
        <v-card-title>New Lab Result</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="createLabResult">
            <v-text-field
              v-model="newLabResultData.patientFullName"
              label="Patient Full Name"
              required
            ></v-text-field>
            <v-text-field v-model="newLabResultData.testName" label="Test Name" required></v-text-field>
            <v-text-field v-model="newLabResultData.result" label="Result" required></v-text-field>
            <v-text-field v-model="newLabResultData.notes" label="Notes"></v-text-field>
            <v-text-field v-model="newLabResultData.performedAt" label="Performed At" type="date" required></v-text-field>
            <v-btn type="submit" color="primary">Create</v-btn>
            <v-btn @click="newLabResultDialog = false" color="secondary">Cancel</v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Success/Error Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../utils/api';

const labResults = ref([]); // List of lab results
const searchQuery = ref(''); // Search query
const loading = ref(false); // Loading state

// Pagination state
const currentPage = ref(1);
const itemsPerPage = ref(10); // Number of items per page
const totalPages = computed(() => Math.ceil(filteredLabResults.value.length / itemsPerPage.value));

// Table headers
const headers = [
  { title: 'Test Name', value: 'testName' },
  { title: 'Result', value: 'result' },
  { title: 'Notes', value: 'notes' },
  { title: 'Performed At', value: 'performedAt' },
  { title: 'Patient Name', value: 'patientFullName' },
];

// New lab result dialog state
const newLabResultDialog = ref(false);
const newLabResultData = ref({
  patientFullName: '',
  testName: '',
  result: '',
  notes: '',
  performedAt: '',
});

// Snackbar for feedback
const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
});

// Fetch lab results for the authenticated user
const fetchLabResults = async () => {
  try {
    loading.value = true;
    const response = await api.get('/my-lab-results'); // Ensure the URL matches the backend route
    
    // Log the response for debugging
    console.log('Backend response:', response.data);

    // Ensure the response contains the expected data structure
    if (response.data && response.data.labResults) {
      labResults.value = response.data.labResults.map((result) => ({
        ...result,
        patientFullName: result.patient.fullName, // Add patient fullName to each lab result
      }));
    } else {
      console.error('Unexpected response structure:', response.data);
      showSnackbar('Unexpected data format from the server', 'error');
    }
  } catch (error) {
    console.error('Failed to fetch lab results:', error);
    showSnackbar('Failed to fetch lab results', 'error');
  } finally {
    loading.value = false;
  }
};

// Filter lab results based on search query
const filteredLabResults = computed(() => {
  if (!searchQuery.value) {
    return labResults.value; // Return all lab results if no search query
  }
  return labResults.value.filter((result) =>
    result.testName.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// Handle search
const handleSearch = () => {
  currentPage.value = 1; // Reset to the first page when searching
};

// Handle page change
const handlePageChange = (page) => {
  currentPage.value = page;
};

// Format date to dd/mm/yyyy
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Open new lab result dialog
const openNewLabResultDialog = () => {
  newLabResultDialog.value = true;
};

// Create a new lab result
const createLabResult = async () => {
  try {
    // Fetch patient ID based on full name
    const patientResponse = await api.get('/patients/search', {
      params: { name: newLabResultData.value.patientFullName },
    });

    if (patientResponse.data.patients.length === 0) {
      throw new Error('Patient not found');
    }

    const patientId = patientResponse.data.patients[0].id;

    // Create the lab result
    const response = await api.post('/lab-results', {
      ...newLabResultData.value,
      patientId,
    });

    labResults.value.push(response.data); // Add the new lab result to the list
    newLabResultDialog.value = false; // Close the dialog
    newLabResultData.value = { // Reset the form
      patientFullName: '',
      testName: '',
      result: '',
      notes: '',
      performedAt: '',
    };

    showSnackbar('Lab result created successfully!', 'success');
  } catch (error) {
    console.error('Failed to create lab result:', error);
    showSnackbar(`Failed to create lab result: ${error.message}`, 'error');
  }
};

// Show snackbar message
const showSnackbar = (message, color = 'success') => {
  snackbar.value.message = message;
  snackbar.value.color = color;
  snackbar.value.show = true;
};

// Fetch data on component mount
onMounted(() => {
  fetchLabResults();
});
</script>
