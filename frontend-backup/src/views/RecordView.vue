<template>
  <v-container>
    <v-card>
      <v-card-title>Medical Records</v-card-title>
      <v-card-text>
        <!-- Button to navigate to the new medical record view -->
        <v-btn @click="navigateToNewMedicalRecord" color="primary" class="mb-4">New Medical Record</v-btn>

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
        </v-row>

        <!-- Table to display all medical records with pagination -->
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
          <template v-slot:item.actions="{ item }">
            <v-btn @click="editMedicalRecord(item)" color="warning" small>Edit</v-btn>
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
import { ref, computed, onMounted } from 'vue';
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

// Search query for filtering medical records
const searchQuery = ref('');

// Pagination state
const currentPage = ref(1);
const itemsPerPage = ref(10); // Number of items per page
const totalPages = computed(() => Math.ceil(filteredMedicalRecords.value.length / itemsPerPage.value));

// Loading state
const loading = ref(false);

// Table headers
const headers = [
  { title: 'ID', value: 'id' },
  { title: 'Patient ID', value: 'patientId' },
  { title: 'Diagnosis', value: 'diagnosis' },
  { title: 'Notes', value: 'notes' },
  { title: 'Actions', value: 'actions', sortable: false },
];

// Fetch all medical records on component mount
onMounted(() => {
  fetchMedicalRecords();
});

// Fetch all medical records
const fetchMedicalRecords = async () => {
  try {
    loading.value = true;
    const response = await api.get('/medical-records');
    medicalRecords.value = response.data['Medical Records'];
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
