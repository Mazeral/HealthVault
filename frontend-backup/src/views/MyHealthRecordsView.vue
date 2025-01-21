<template>
  <v-container>
    <v-card>
      <v-card-title>My Health Records</v-card-title>
      <!-- Add a medical record button -->
      <v-card-text>
        <!-- Search Bar -->
        <v-row>
          <v-col cols="12" md="6">
            <v-btn color="primary" @click="openNewMedicalRecordDialog">New Medical Record</v-btn>
          </v-col>
        </v-row>
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
            <v-text-field
              v-model="patientSearchQuery"
              label="Search by Patient Name"
              outlined
              dense
              @input="handleSearchInput"
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row>
        </v-row>

        <!-- Medical Records Table -->
        <v-data-table
          :headers="headers"
          :items="medicalRecords"
          :items-per-page="itemsPerPage"
          :page.sync="currentPage"
          :loading="loading"
          loading-text="Loading... Please wait"
          hide-default-footer
        >
          <template v-slot:item.diagnosis="{ item }">
            {{ item.diagnosis || 'N/A' }}
          </template>
          <template v-slot:item.notes="{ item }">
            {{ item.notes || 'N/A' }}
          </template>
          <template v-slot:item.patientFullName="{ item }">
            {{ item.patientFullName || 'N/A' }}
          </template>
          <template v-slot:item.createdAt="{ item }">
            {{ formatDate(item.createdAt) }}
          </template>
          <template v-slot:item.actions="{ item }">
            <v-row no-gutters>
              <v-col cols="auto">
                <v-btn @click="editMedicalRecord(item)" color="primary" class="mr-2">Edit</v-btn>
              </v-col>
              <v-col cols="auto">
                <v-btn @click="confirmDelete(item)" color="error">Delete</v-btn>
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
      </v-card-text>
    </v-card>

    <!-- New Medical Record Dialog -->
  <v-dialog v-model="newMedicalRecordDialog" max-width="500">
    <v-card>
      <v-card-title>New Medical Record</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="createMedicalRecord">
          <!-- Patient Full Name Field (Optional) -->
          <v-text-field
            v-model="newMedicalRecordData.patientFullName"
            label="Patient Full Name"
          ></v-text-field>

          <!-- Diagnosis Field -->
          <v-text-field
            v-model="newMedicalRecordData.diagnosis"
            label="Diagnosis"
            required
          ></v-text-field>

          <!-- Notes Field -->
          <v-text-field
            v-model="newMedicalRecordData.notes"
            label="Notes"
          ></v-text-field>

          <!-- Action Buttons -->
          <v-btn type="submit" color="primary" class="ma-2">Create</v-btn>
          <v-btn @click="newMedicalRecordDialog = false" color="secondary" class="ma-2">Cancel</v-btn>

          <!-- Error message for creating a new medical record -->
          <v-alert v-if="createMedicalRecordError" type="error" class="mt-4">
            {{ createMedicalRecordError }}
          </v-alert>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>

    <!-- Edit Medical Record Dialog -->
    <v-dialog v-model="editMedicalRecordDialog" max-width="500">
      <v-card>
        <v-card-title>Edit Medical Record</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="updateMedicalRecord">
            <!-- Patient Full Name Field (Non-Optional) -->
            <v-text-field
              v-model="editMedicalRecordData.patientFullName"
              label="Patient Full Name"
              required
            ></v-text-field>

            <!-- Diagnosis Field -->
            <v-text-field
              v-model="editMedicalRecordData.diagnosis"
              label="Diagnosis"
              required
            ></v-text-field>

            <!-- Notes Field -->
            <v-text-field
              v-model="editMedicalRecordData.notes"
              label="Notes"
            ></v-text-field>

            <!-- Action Buttons -->
            <v-btn type="submit" color="primary">Update</v-btn>
            <v-btn @click="editMedicalRecordDialog = false" color="secondary">Cancel</v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="headline">Are you sure?</v-card-title>
        <v-card-text>
          You are about to delete the medical record for: <strong>{{ medicalRecordToDelete?.patient?.fullName }}</strong>. This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="secondary" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="deleteMedicalRecordConfirmed">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar for error messages -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.message }}
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="snackbar.show = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../utils/api';

const medicalRecords = ref([]); // List of medical records
const searchQuery = ref(''); // Search query for diagnosis
const patientSearchQuery = ref(''); // Search query for patient name
const loading = ref(false); // Loading state for fetching records
const loadingUpdate = ref(false); // Loading state for updating a record

// Snackbar for feedback
const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
});

// Show snackbar message
const showSnackbar = (message, color = 'success') => {
  snackbar.value.message = message;
  snackbar.value.color = color;
  snackbar.value.show = true;
};

// Pagination state
const currentPage = ref(1);
const itemsPerPage = ref(10); // Number of items per page
const totalPages = computed(() => Math.ceil(filteredMedicalRecords.value.length / itemsPerPage.value));
const createMedicalRecordError = ref('');

// Table headers
const headers = [
  { title: 'Diagnosis', value: 'diagnosis' },
  { title: 'Notes', value: 'notes' },
  { title: 'Patient Name', value: 'patientFullName' },
  { title: 'Created At', value: 'createdAt' },
  { title: 'Actions', value: 'actions', sortable: false },
];

// New medical record dialog state
const newMedicalRecordDialog = ref(false);
const newMedicalRecordData = ref({
  diagnosis: '',
  notes: '',
  patientFullName: '',
});

// Edit medical record dialog state
const editMedicalRecordDialog = ref(false);
const editMedicalRecordData = ref({
  id: null,
  diagnosis: '',
  notes: '',
  patientFullName: '', // Ensure this field is included
});

// Delete confirmation dialog state
const deleteDialog = ref(false);
const medicalRecordToDelete = ref(null); // Stores the medical record to be deleted

// Fetch medical records for the authenticated user
const fetchMedicalRecords = async () => {
  try {
    loading.value = true;
    const response = await api.get('/my-medical-records');

    // Transform the data to match the table structure
    medicalRecords.value = response.data.medicalRecords.map((record) => ({
      id: record.id,
      diagnosis: record.diagnosis,
      notes: record.notes,
      patientFullName: record.patient?.fullName || 'N/A', // Extract patient full name
      createdAt: record.createdAt,
    }));

    console.log("Fetched and transformed medicalRecords:", medicalRecords.value); // Debugging
  } catch (error) {
    console.error('Failed to fetch medical records:', error);
    showSnackbar('Failed to fetch medical records', 'error');
  } finally {
    loading.value = false;
  }
};

// Filter and sort medical records based on search queries
const filteredMedicalRecords = computed(() => {
  let filtered = medicalRecords.value;

  // Filter by diagnosis (match first letters)
  if (searchQuery.value) {
    filtered = filtered.filter((record) =>
      record.diagnosis.toLowerCase().startsWith(searchQuery.value.toLowerCase())
    );
  }

  // Filter by patient name (match first letters)
  if (patientSearchQuery.value) {
    filtered = filtered.filter((record) =>
      record.patient?.fullName
        .toLowerCase()
        .startsWith(patientSearchQuery.value.toLowerCase())
    );
  }

  // Sort by createdAt in descending order (newest first)
  return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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
    console.log("Starting createMedicalRecord method");

    // Log the data being sent to the API
    console.log("Data being sent to API:", {
      ...newMedicalRecordData.value,
      patient: {
        fullName: newMedicalRecordData.value.patientFullName || 'N/A',
      },
    });

    const response = await api.post('/medical-record/', {
      ...newMedicalRecordData.value,
      patient: {
        fullName: newMedicalRecordData.value.patientFullName || 'N/A',
      },
    });

    console.log("API Response:", response.data); // Debugging: Log the response

    // Flatten the new record
    const newRecord = {
      id: response.data.id,
      diagnosis: response.data.diagnosis || newMedicalRecordData.value.diagnosis,
      notes: response.data.notes || newMedicalRecordData.value.notes,
      patientFullName: response.data.patient?.fullName || newMedicalRecordData.value.patientFullName || 'N/A',
      createdAt: response.data.createdAt || new Date().toISOString(),
    };

    console.log("New Record to Add:", newRecord); // Debugging: Log the new record

    // Log the medicalRecords array BEFORE insertion
    console.log("medicalRecords BEFORE insertion:", medicalRecords.value);

    // Add the new medical record to the list
    medicalRecords.value.unshift(newRecord); // Add to the beginning of the array

    // Log the medicalRecords array AFTER insertion
    console.log("medicalRecords AFTER insertion:", medicalRecords.value);

    // Close the dialog and reset the form
    newMedicalRecordDialog.value = false;
    console.log("Dialog closed");

    newMedicalRecordData.value = {
      diagnosis: '',
      notes: '',
      patientFullName: '',
    };
    console.log("Form reset"); // Debugging: Log the form reset

    // Clear any previous error message
    createMedicalRecordError.value = '';

    // Show success message
    showSnackbar('Medical record created successfully!', 'success');
    console.log("Snackbar shown");
  } catch (error) {
    console.error('Failed to create medical record:', error);
    createMedicalRecordError.value = error.response?.data?.message || 'Failed to create medical record. Please try again.';
  }
};

// Open edit dialog with medical record data
const editMedicalRecord = (medicalRecord) => {
  editMedicalRecordData.value = {
    id: medicalRecord.id,
    diagnosis: medicalRecord.diagnosis,
    notes: medicalRecord.notes,
    patientFullName: medicalRecord.patientFullName || '', // Pre-fill with current patient name
  };
  editMedicalRecordDialog.value = true;
};

// Update a medical record
const updateMedicalRecord = async () => {
  try {
    loadingUpdate.value = true;

    // Prepare the request body
    const requestBody = {
      ...editMedicalRecordData.value,
      patient: {
        fullName: editMedicalRecordData.value.patientFullName,
      },
    };

    // Send the update request
    const response = await api.put(
      `/medical-records/${editMedicalRecordData.value.id}`,
      requestBody
    );

    // Update the medical record in the list
    const updatedMedicalRecord = response.data.updated;

    // Find the index of the updated record in the medicalRecords array
    const index = medicalRecords.value.findIndex(
      (record) => record.id === updatedMedicalRecord.id
    );

    if (index !== -1) {
      // Preserve the patientFullName from the existing record
      const existingRecord = medicalRecords.value[index];
      updatedMedicalRecord.patientFullName = existingRecord.patientFullName;

      // Update the record in the array
      medicalRecords.value[index] = {
        ...updatedMedicalRecord,
        patientFullName: existingRecord.patientFullName, // Ensure patientFullName is preserved
      };
    }

    // Show success message
    showSnackbar('Medical record updated successfully!', 'success');

    // Close the edit dialog
    editMedicalRecordDialog.value = false;
  } catch (error) {
    console.error('Failed to update medical record:', error);
    showSnackbar('Failed to update medical record. Please try again.', 'error');
  } finally {
    loadingUpdate.value = false;
  }
};

// Open confirmation dialog for deletion
const confirmDelete = (medicalRecord) => {
  medicalRecordToDelete.value = medicalRecord;
  deleteDialog.value = true;
};

// Delete a medical record after confirmation
const deleteMedicalRecordConfirmed = async () => {
  try {
    await api.delete(`/medical-records/${medicalRecordToDelete.value.id}`);
    fetchMedicalRecords(); // Refresh the list after deletion
    showSnackbar('Medical record deleted successfully!', 'success');
  } catch (error) {
    console.error('Failed to delete medical record:', error);
    showSnackbar('Failed to delete medical record', 'error');
  } finally {
    deleteDialog.value = false; // Close the dialog
  }
};

// Fetch data on component mount
onMounted(() => {
  fetchMedicalRecords();
});
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

.custom-button {
  width: 100px; /* Set a custom width */
}
</style>
