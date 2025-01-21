<template>
  <v-container>
    <v-card>
      <v-card-title>Medical Records</v-card-title>
      <v-card-text>
        <!-- Button to open the new medical record dialog -->
        <v-btn @click="newMedicalRecordDialog = true" color="primary" class="mb-4">New Medical Record</v-btn>

        <!-- New Medical Record Dialog -->
        <v-dialog v-model="newMedicalRecordDialog" max-width="500">
          <v-card>
            <v-card-title>Create New Medical Record</v-card-title>
            <v-card-text>
              <v-form @submit.prevent="createNewMedicalRecord">
                <v-text-field
                  v-model="newMedicalRecordData.patientFullName"
                  label="Patient Full Name"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="newMedicalRecordData.diagnosis"
                  label="Diagnosis"
                  required
                ></v-text-field>
                <v-textarea
                  v-model="newMedicalRecordData.notes"
                  label="Notes"
                ></v-textarea>
                <v-btn type="submit" color="primary" class="mr-2">Create</v-btn>
                <v-btn @click="newMedicalRecordDialog = false" color="secondary">Cancel</v-btn>
              </v-form>
            </v-card-text>
          </v-card>
        </v-dialog>

        <!-- Search Bars -->
        <v-row class="mt-4">
          <v-col cols="12" md="6">
            <v-text-field
              v-model="searchDiagnosis"
              label="Search by Diagnosis"
              outlined
              dense
              @input="handleSearchInput"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="searchPatientName"
              label="Search by Patient Name"
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
          <template v-slot:item.patientFullName="{ item }">
            {{ item.patientFullName }}
          </template>
          <template v-slot:item.actions="{ item }">
            <v-row no-gutters>
              <v-col>
                <v-btn @click="editMedicalRecord(item)" color="primary" block class="mb-2">Edit</v-btn>
              </v-col>
              <v-col>
                <v-btn @click="confirmDelete(item)" color="error" block class="mb-2">Delete</v-btn>
              </v-col>
            </v-row>
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
                <v-text-field
                  v-model="editRecordData.patientFullName"
                  label="Patient Full Name"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="editRecordData.diagnosis"
                  label="Diagnosis"
                  required
                ></v-text-field>
                <v-textarea
                  v-model="editRecordData.notes"
                  label="Notes"
                ></v-textarea>
                <v-btn type="submit" color="primary" class="mr-2">Update</v-btn>
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
              You are about to delete the medical record for patient: <strong>{{ recordToDelete?.patientFullName }}</strong>. This action cannot be undone.
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

// Data for creating a new medical record
const newMedicalRecordDialog = ref(false);
const newMedicalRecordData = ref({
  patientFullName: '',
  diagnosis: '',
  notes: '',
});

// Data for editing a medical record
const editRecordData = ref({
  id: null,
  patientFullName: '',
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

// Search queries for filtering medical records
const searchDiagnosis = ref('');
const searchPatientName = ref('');

// Pagination state
const currentPage = ref(1);
const itemsPerPage = ref(10); // Number of items per page
const totalPages = computed(() => Math.ceil(filteredMedicalRecords.value.length / itemsPerPage.value));

// Loading state
const loading = ref(false);

// Table headers
const headers = [
  { title: 'ID', value: 'id' },
  { title: 'Patient Name', value: 'patientFullName' }, // Display patient full name
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
    // Include patient fullName in the response
    medicalRecords.value = response.data['Medical Records'].map((record) => ({
      ...record,
      patientFullName: record.patient.fullName, // Add patient fullName to each medical record
    }));
  } catch (error) {
    console.error('Failed to fetch medical records:', error);
  } finally {
    loading.value = false;
  }
};

// Create a new medical record
const createNewMedicalRecord = async () => {
  try {
    const response = await api.post('/medical-records', newMedicalRecordData.value);
    console.log('New medical record created:', response.data);

    // Close the dialog
    newMedicalRecordDialog.value = false;

    // Refresh the medical records list
    fetchMedicalRecords();

    // Reset the form data
    newMedicalRecordData.value = {
      patientFullName: '',
      diagnosis: '',
      notes: '',
    };
  } catch (error) {
    console.error('Failed to create new medical record:', error);
  }
};

// Filter medical records based on search queries
const filteredMedicalRecords = computed(() => {
  let filtered = medicalRecords.value;

  // Filter by diagnosis
  if (searchDiagnosis.value) {
    filtered = filtered.filter((record) =>
      record.diagnosis.toLowerCase().includes(searchDiagnosis.value.toLowerCase())
    );
  }

  // Filter by patient name
  if (searchPatientName.value) {
    filtered = filtered.filter((record) =>
      record.patientFullName.toLowerCase().includes(searchPatientName.value.toLowerCase())
    );
  }

  return filtered;
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
  editRecordData.value = {
    ...record,
    patientFullName: record.patientFullName || '', // Initialize patientFullName
  };
  editDialog.value = true;
};

// Update a medical record
const updateMedicalRecord = async () => {
  try {
    const response = await api.put(`/medical-records/${editRecordData.value.id}`, editRecordData.value);
    const updatedRecord = response.data.updated;

    // Find the index of the updated medical record in the medicalRecords array
    const index = medicalRecords.value.findIndex((record) => record.id === updatedRecord.id);

    if (index !== -1) {
      // Update the medical record in the array
      medicalRecords.value[index] = {
        ...updatedRecord,
        patientFullName: updatedRecord.patientFullName || "Unknown", // Ensure patientFullName is preserved
      };
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
</script>

<style scoped>
.v-table {
  margin-top: 20px;
}

/* Ensure the container and card have a white background */
.v-container {
  background-color: white;
}

.v-card {
  background-color: white;
}

/* Ensure the table has a white background */
.v-data-table {
  background-color: white;
}
</style>
