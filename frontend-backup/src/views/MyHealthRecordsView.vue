<template>
  <v-container>
    <v-card>
      <v-card-title>My Health Records</v-card-title>
      <v-card-text>
        <!-- Search Bar -->
        <v-row class="mt-4">
          <v-col cols="12" md="6">
            <v-text-field
              v-model="searchQuery"
              label="Search by Diagnosis"
              outlined
              dense
              @input="handleSearchInput"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-btn color="primary" @click="openNewMedicalRecordDialog">New Medical Record</v-btn>
          </v-col>
        </v-row>

        <!-- Medical Records Table -->
        <v-data-table
          :headers="headers"
          :items="filteredMedicalRecords"
          :items-per-page="itemsPerPage"
          :page.sync="currentPage"
          :search="searchQuery"
          :loading="loading"
          loading-text="Loading... Please wait"
          hide-default-footer
        >
          <template v-slot:item.diagnosis="{ item }">
            {{ item.diagnosis }}
          </template>
          <template v-slot:item.notes="{ item }">
            {{ item.notes }}
          </template>
          <template v-slot:item.createdAt="{ item }">
            {{ formatDate(item.createdAt) }}
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

    <!-- New Medical Record Dialog -->
    <v-dialog v-model="newMedicalRecordDialog" max-width="500">
      <v-card>
        <v-card-title>New Medical Record</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="createMedicalRecord">
            <v-text-field v-model="newMedicalRecordData.diagnosis" label="Diagnosis" required></v-text-field>
            <v-text-field v-model="newMedicalRecordData.notes" label="Notes"></v-text-field>
            <v-btn type="submit" color="primary">Create</v-btn>
            <v-btn @click="newMedicalRecordDialog = false" color="secondary">Cancel</v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../utils/api';

const medicalRecords = ref([]); // List of medical records
const searchQuery = ref(''); // Search query
const loading = ref(false); // Loading state

// Pagination state
const currentPage = ref(1);
const itemsPerPage = ref(10); // Number of items per page
const totalPages = computed(() => Math.ceil(filteredMedicalRecords.value.length / itemsPerPage.value));

// Table headers
const headers = [
  { title: 'Diagnosis', value: 'diagnosis' },
  { title: 'Notes', value: 'notes' },
  { title: 'Created At', value: 'createdAt' },
];

// New medical record dialog state
const newMedicalRecordDialog = ref(false);
const newMedicalRecordData = ref({
  diagnosis: '',
  notes: '',
});

// Fetch medical records for the authenticated user
const fetchMedicalRecords = async () => {
  try {
    loading.value = true;
    const response = await api.get('/my-medical-records');
    medicalRecords.value = response.data.medicalRecords;
  } catch (error) {
    console.error('Failed to fetch medical records:', error);
  } finally {
    loading.value = false;
  }
};

// Filter medical records based on search query
const filteredMedicalRecords = computed(() => {
  if (!searchQuery.value) {
    return medicalRecords.value; // Return all medical records if no search query
  }
  return medicalRecords.value.filter((record) =>
    record.diagnosis.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// Handle search input
const handleSearchInput = () => {
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

// Open new medical record dialog
const openNewMedicalRecordDialog = () => {
  newMedicalRecordDialog.value = true;
};

// Create a new medical record
const createMedicalRecord = async () => {
  try {
    const response = await api.post('/medical-record/', newMedicalRecordData.value);
    medicalRecords.value.push(response.data); // Add the new medical record to the list
    newMedicalRecordDialog.value = false; // Close the dialog
    newMedicalRecordData.value = { // Reset the form
      diagnosis: '',
      notes: '',
    };
  } catch (error) {
    console.error('Failed to create medical record:', error);
  }
};

// Fetch data on component mount
onMounted(() => {
  fetchMedicalRecords();
});
</script>
