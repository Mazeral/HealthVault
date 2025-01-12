<template>
  <v-container>
    <v-card>
      <v-card-title>Lab Results</v-card-title>
      <v-card-text>
        <!-- Button to navigate to the new lab result view -->
        <v-btn @click="navigateToNewLabResult" color="primary" class="mb-4">New Lab Result</v-btn>

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

        <!-- Table to display all lab results with pagination -->
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
          <template v-slot:item.actions="{ item }">
            <v-btn @click="editLabResult(item)" color="warning" small>Edit</v-btn>
            <v-btn @click="confirmDelete(item)" color="error" small>Delete</v-btn>
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

        <!-- Confirmation Dialog for Deletion -->
        <v-dialog v-model="deleteDialog" max-width="400">
          <v-card>
            <v-card-title class="headline">Are you sure?</v-card-title>
            <v-card-text>
              You are about to delete the lab result for patient ID: <strong>{{ labResultToDelete?.patientId }}</strong>. This action cannot be undone.
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="secondary" @click="deleteDialog = false">Cancel</v-btn>
              <v-btn color="error" @click="deleteLabResultConfirmed">Delete</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../utils/api';

const router = useRouter();

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

// Confirmation dialog state for deletion
const deleteDialog = ref(false);
const labResultToDelete = ref(null); // Stores the lab result to be deleted

// Search query for filtering lab results
const searchQuery = ref('');

// Pagination state
const currentPage = ref(1);
const itemsPerPage = ref(10); // Number of items per page
const totalPages = computed(() => Math.ceil(filteredLabResults.value.length / itemsPerPage.value));

// Loading state
const loading = ref(false);

// Table headers
const headers = [
  { title: 'ID', value: 'id' },
  { title: 'Patient ID', value: 'patientId' },
  { title: 'Test Name', value: 'testName' },
  { title: 'Result', value: 'result' },
  { title: 'Notes', value: 'notes' },
  { title: 'Performed At', value: 'performedAt' },
  { title: 'Actions', value: 'actions', sortable: false },
];

// Fetch all lab results on component mount
onMounted(() => {
  fetchLabResults();
});

// Fetch all lab results
const fetchLabResults = async () => {
  try {
    loading.value = true;
    const response = await api.get('/lab-results');
    labResults.value = response.data['Lab results'];
  } catch (error) {
    console.error('Failed to fetch lab results:', error);
  } finally {
    loading.value = false;
  }
};

// Format date to dd/mm/yyyy
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Filter lab results based on search query
const filteredLabResults = computed(() => {
  if (!searchQuery.value) {
    return labResults.value; // Return all lab results if no search query
  }
  return labResults.value.filter((labResult) =>
    labResult.testName.toLowerCase().includes(searchQuery.value.toLowerCase())
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

// Open confirmation dialog for deletion
const confirmDelete = (labResult) => {
  labResultToDelete.value = labResult;
  deleteDialog.value = true;
};

// Delete a lab result after confirmation
const deleteLabResultConfirmed = async () => {
  try {
    await api.delete(`/lab-results/${labResultToDelete.value.id}`);
    labResults.value = labResults.value.filter((result) => result.id !== labResultToDelete.value.id);
  } catch (error) {
    console.error('Failed to delete lab result:', error);
  } finally {
    deleteDialog.value = false; // Close the dialog
  }
};

// Navigate to the new lab result view
const navigateToNewLabResult = () => {
  router.push({ name: 'new-lab-result' });
};
</script>

<style scoped>
.v-table {
  margin-top: 20px;
}
</style>
