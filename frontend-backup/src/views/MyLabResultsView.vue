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
              @input="handleSearchInput"
            ></v-text-field>
          </v-col>
        </v-row>

        <!-- Lab Results Table -->
        <v-data-table
          :headers="headers"
          :items="filteredLabResults"
          :items-per-page="itemsPerPage"
          :page.sync="currentPage"
          :search="searchQuery"
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
];

// Fetch lab results for the authenticated user
const fetchLabResults = async () => {
  try {
    loading.value = true;
    const response = await api.get('/my-lab-results');
    labResults.value = response.data.labResults;
  } catch (error) {
    console.error('Failed to fetch lab results:', error);
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

// Fetch data on component mount
onMounted(() => {
  fetchLabResults();
});
</script>

<style scoped>
.v-table {
  margin-top: 20px;
}
</style>
