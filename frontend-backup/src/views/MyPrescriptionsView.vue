<template>
  <v-container>
    <v-card>
      <v-card-title>My Prescriptions</v-card-title>
      <v-card-text>
        <!-- Search Bar -->
        <v-row class="mt-4">
          <v-col cols="12" md="6">
            <v-text-field
              v-model="searchQuery"
              label="Search by Medication"
              outlined
              dense
              @input="handleSearchInput"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-btn color="primary" @click="openNewPrescriptionDialog">New Prescription</v-btn>
          </v-col>
        </v-row>

        <!-- Prescriptions Table -->
        <v-data-table
          :headers="headers"
          :items="filteredPrescriptions"
          :items-per-page="itemsPerPage"
          :page.sync="currentPage"
          :search="searchQuery"
          :loading="loading"
          loading-text="Loading... Please wait"
          hide-default-footer
        >
          <template v-slot:item.medication="{ item }">
            {{ item.medication }}
          </template>
          <template v-slot:item.dosage="{ item }">
            {{ item.dosage }}
          </template>
          <template v-slot:item.instructions="{ item }">
            {{ item.instructions }}
          </template>
          <template v-slot:item.patient.fullName="{ item }">
            {{ item.patient.fullName }}
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

    <!-- New Prescription Dialog -->
    <v-dialog v-model="newPrescriptionDialog" max-width="500">
      <v-card>
        <v-card-title>New Prescription</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="createPrescription">
            <v-text-field v-model="newPrescriptionData.medication" label="Medication" required></v-text-field>
            <v-text-field v-model="newPrescriptionData.dosage" label="Dosage" required></v-text-field>
            <v-text-field v-model="newPrescriptionData.instructions" label="Instructions"></v-text-field>
            <v-btn type="submit" color="primary">Create</v-btn>
            <v-btn @click="newPrescriptionDialog = false" color="secondary">Cancel</v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../utils/api';

const prescriptions = ref([]); // List of prescriptions
const searchQuery = ref(''); // Search query
const loading = ref(false); // Loading state

// Pagination state
const currentPage = ref(1);
const itemsPerPage = ref(10); // Number of items per page
const totalPages = computed(() => Math.ceil(filteredPrescriptions.value.length / itemsPerPage.value));

// Table headers
const headers = [
  { title: 'Medication', value: 'medication' },
  { title: 'Dosage', value: 'dosage' },
  { title: 'Instructions', value: 'instructions' },
  { title: 'Patient Name', value: 'patient.fullName' },
];

// New prescription dialog state
const newPrescriptionDialog = ref(false);
const newPrescriptionData = ref({
  medication: '',
  dosage: '',
  instructions: '',
});

// Fetch prescriptions for the authenticated user
const fetchPrescriptions = async () => {
  try {
    loading.value = true;
    const response = await api.get('/my-prescriptions');
    prescriptions.value = response.data.prescriptions;
  } catch (error) {
    console.error('Failed to fetch prescriptions:', error);
  } finally {
    loading.value = false;
  }
};

// Filter prescriptions based on search query
const filteredPrescriptions = computed(() => {
  if (!searchQuery.value) {
    return prescriptions.value; // Return all prescriptions if no search query
  }
  return prescriptions.value.filter((prescription) =>
    prescription.medication.toLowerCase().includes(searchQuery.value.toLowerCase())
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

// Open new prescription dialog
const openNewPrescriptionDialog = () => {
  newPrescriptionDialog.value = true;
};

// Create a new prescription
const createPrescription = async () => {
  try {
    const response = await api.post('/prescriptions', newPrescriptionData.value);
    prescriptions.value.push(response.data.prescription); // Add the new prescription to the list
    newPrescriptionDialog.value = false; // Close the dialog
    newPrescriptionData.value = { // Reset the form
      medication: '',
      dosage: '',
      instructions: '',
    };
  } catch (error) {
    console.error('Failed to create prescription:', error);
  }
};

// Fetch data on component mount
onMounted(() => {
  fetchPrescriptions();
});
</script>
