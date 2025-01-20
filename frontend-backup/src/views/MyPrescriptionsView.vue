<template>
  <v-container>
    <v-card>
      <v-card-title>My Prescriptions</v-card-title>
      <v-card-text>
        <!-- Add a new prescription button -->
        <v-row>
          <v-col cols="12" md="6">
            <v-btn color="primary" @click="openNewPrescriptionDialog">New Prescription</v-btn>
          </v-col>
        </v-row>

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
            <v-text-field
              v-model="patientSearchQuery"
              label="Search by Patient Name"
              outlined
              dense
              @input="handleSearchInput"
            ></v-text-field>
          </v-col>
        </v-row>

        <!-- Prescriptions Table -->
        <v-data-table
          :headers="headers"
          :items="filteredPrescriptions"
          :items-per-page="itemsPerPage"
          :page.sync="currentPage"
          :loading="loading"
          loading-text="Loading... Please wait"
          hide-default-footer
        >
          <template v-slot:item.medication="{ item }">
            {{ item.medication || 'N/A' }}
          </template>
          <template v-slot:item.dosage="{ item }">
            {{ item.dosage || 'N/A' }}
          </template>
          <template v-slot:item.instructions="{ item }">
            {{ item.instructions || 'N/A' }}
          </template>
          <template v-slot:item.patientFullName="{ item }">
            {{ item.patient?.fullName || 'N/A' }}
          </template>
          <template v-slot:item.actions="{ item }">
            <v-btn @click="editPrescription(item)" color="primary" small>Edit</v-btn>
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
      </v-card-text>
    </v-card>

    <!-- New Prescription Dialog -->
	<v-dialog v-model="newPrescriptionDialog" max-width="500">
	  <v-card>
		<v-card-title>New Prescription</v-card-title>
		<v-card-text>
		  <v-form @submit.prevent="createPrescription">
			<!-- Patient Full Name Field -->
			<v-text-field
			  v-model="newPrescriptionData.patientFullName"
			  label="Patient Full Name"
			  required
			></v-text-field>

			<!-- Medication Field -->
			<v-text-field
			  v-model="newPrescriptionData.medication"
			  label="Medication"
			  required
			></v-text-field>

			<!-- Dosage Field -->
			<v-text-field
			  v-model="newPrescriptionData.dosage"
			  label="Dosage"
			  required
			></v-text-field>

			<!-- Instructions Field -->
			<v-text-field
			  v-model="newPrescriptionData.instructions"
			  label="Instructions"
			></v-text-field>

			<!-- Action Buttons -->
			<v-btn type="submit" color="primary">Create</v-btn>
			<v-btn @click="newPrescriptionDialog = false" color="secondary">Cancel</v-btn>
		  </v-form>
		</v-card-text>
	  </v-card>
	</v-dialog>

    <!-- Edit Prescription Dialog -->
	<v-dialog v-model="editPrescriptionDialog" max-width="500">
	  <v-card>
		<v-card-title>Edit Prescription</v-card-title>
		<v-card-text>
		  <v-form @submit.prevent="updatePrescription">
			<!-- Patient Full Name Field -->
			<v-text-field
			  v-model="editPrescriptionData.patientFullName"
			  label="Patient Full Name"
			  required
			></v-text-field>

			<!-- Medication Field -->
			<v-text-field
			  v-model="editPrescriptionData.medication"
			  label="Medication"
			  required
			></v-text-field>

			<!-- Dosage Field -->
			<v-text-field
			  v-model="editPrescriptionData.dosage"
			  label="Dosage"
			  required
			></v-text-field>

			<!-- Instructions Field -->
			<v-text-field
			  v-model="editPrescriptionData.instructions"
			  label="Instructions"
			></v-text-field>

			<!-- Action Buttons -->
			<v-btn type="submit" color="primary">Update</v-btn>
			<v-btn @click="editPrescriptionDialog = false" color="secondary">Cancel</v-btn>
		  </v-form>
		</v-card-text>
	  </v-card>
	</v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="headline">Are you sure?</v-card-title>
        <v-card-text>
          You are about to delete the prescription for: <strong>{{ prescriptionToDelete?.patient?.fullName }}</strong>. This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="secondary" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="deletePrescriptionConfirmed">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../utils/api';

const prescriptions = ref([]); // List of prescriptions
const searchQuery = ref(''); // Search query for medication
const patientSearchQuery = ref(''); // Search query for patient name
const loading = ref(false); // Loading state for fetching records
const loadingUpdate = ref(false); // Loading state for updating a record

// Pagination state
const currentPage = ref(1);
const itemsPerPage = ref(10); // Number of items per page
const totalPages = computed(() => Math.ceil(filteredPrescriptions.value.length / itemsPerPage.value));

// Table headers
const headers = [
  { title: 'Medication', value: 'medication' },
  { title: 'Dosage', value: 'dosage' },
  { title: 'Instructions', value: 'instructions' },
  { title: 'Patient Name', value: 'patient.fullName' }, // Use nested field
  { title: 'Actions', value: 'actions', sortable: false }, // Add actions column
];

// New prescription dialog state
const newPrescriptionDialog = ref(false);
const newPrescriptionData = ref({
  patientFullName: '',
  medication: '',
  dosage: '',
  instructions: '',
});

// Edit prescription dialog state
const editPrescriptionDialog = ref(false);
const editPrescriptionData = ref({
  id: null,
  patientFullName: '',
  medication: '',
  dosage: '',
  instructions: '',
});

// Delete confirmation dialog state
const deleteDialog = ref(false);
const prescriptionToDelete = ref(null); // Stores the prescription to be deleted

// Fetch prescriptions for the authenticated user
const fetchPrescriptions = async () => {
  try {
    loading.value = true;
    const response = await api.get('/my-prescriptions');

    console.log("API Response:", response.data); // Debugging: Log the API response

    // Transform the data to match the table structure
    prescriptions.value = response.data.prescriptions.map((prescription) => ({
      ...prescription,
      patient: {
        fullName: prescription.patient?.fullName || 'N/A', // Ensure patient.fullName is included
      },
    }));

    console.log("Fetched and transformed prescriptions:", prescriptions.value); // Debugging
  } catch (error) {
    console.error('Failed to fetch prescriptions:', error);
  } finally {
    loading.value = false;
  }
};

// Filter prescriptions based on search queries
const filteredPrescriptions = computed(() => {
  let filtered = prescriptions.value;

  // Filter by medication (match first letters)
  if (searchQuery.value) {
    filtered = filtered.filter((prescription) =>
      prescription.medication.toLowerCase().startsWith(searchQuery.value.toLowerCase())
    );
  }

  // Filter by patient name (match first letters)
  if (patientSearchQuery.value) {
    filtered = filtered.filter((prescription) =>
      prescription.patient.fullName
        .toLowerCase()
        .startsWith(patientSearchQuery.value.toLowerCase())
    );
  }

  // Sort by prescribedAt in descending order (newest first)
  return filtered.sort((a, b) => new Date(b.prescribedAt) - new Date(a.prescribedAt));
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
    const response = await api.post('/prescriptions', {
      ...newPrescriptionData.value,
      patient: {
        fullName: newPrescriptionData.value.patientFullName,
      },
    });

    // Add the new prescription to the list
    prescriptions.value.unshift({
      ...response.data.prescription,
      patient: {
        fullName: response.data.prescription.patient?.fullName || 'N/A', // Ensure patient.fullName is included
      },
    });

    // Close the dialog and reset the form
    newPrescriptionDialog.value = false;
    newPrescriptionData.value = {
      patientFullName: '',
      medication: '',
      dosage: '',
      instructions: '',
    };
  } catch (error) {
    console.error('Failed to create prescription:', error);
  }
};

// Open edit dialog with prescription data
const editPrescription = (prescription) => {
  editPrescriptionData.value = {
    ...prescription,
    patientFullName: prescription.patient?.fullName || '', // Initialize with current full name
  };
  editPrescriptionDialog.value = true;
};

// Update a prescription
const updatePrescription = async () => {
  try {
    loadingUpdate.value = true;
    const response = await api.put(
      `/prescriptions/${editPrescriptionData.value.id}`,
      {
        ...editPrescriptionData.value,
        patient: {
          fullName: editPrescriptionData.value.patientFullName,
        },
      }
    );

    console.log("Update Prescription Response:", response.data); // Debugging: Log the response

    // Update the prescription in the list
    const updatedPrescription = response.data.updated;
    const index = prescriptions.value.findIndex(
      (prescription) => prescription.id === updatedPrescription.id
    );
    if (index !== -1) {
      prescriptions.value[index] = {
        ...updatedPrescription,
        patient: {
          fullName: updatedPrescription.patient?.fullName || 'N/A', // Ensure patient.fullName is included
        },
      };
    }

    // Close the edit dialog
    editPrescriptionDialog.value = false;
  } catch (error) {
    console.error('Failed to update prescription:', error);
  } finally {
    loadingUpdate.value = false;
  }
};

// Open confirmation dialog for deletion
const confirmDelete = (prescription) => {
  prescriptionToDelete.value = prescription;
  deleteDialog.value = true;
};

// Delete a prescription after confirmation
const deletePrescriptionConfirmed = async () => {
  try {
    await api.delete(`/prescriptions/${prescriptionToDelete.value.id}`);
    fetchPrescriptions(); // Refresh the list after deletion
  } catch (error) {
    console.error('Failed to delete prescription:', error);
  } finally {
    deleteDialog.value = false; // Close the dialog
  }
};

// Fetch data on component mount
onMounted(() => {
  fetchPrescriptions();
});
</script>
