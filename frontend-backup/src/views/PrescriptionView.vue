<template>
  <v-container>
    <v-card>
      <v-card-title>Prescriptions</v-card-title>
      <v-card-text>
        <!-- Button to open the new prescription dialog -->
        <v-btn @click="newPrescriptionDialog = true" color="primary" class="mb-4">New Prescription</v-btn>

        <!-- New Prescription Dialog -->
        <v-dialog v-model="newPrescriptionDialog" max-width="500">
          <v-card>
            <v-card-title>Create New Prescription</v-card-title>
            <v-card-text>
              <v-form @submit.prevent="createNewPrescription">
                <v-text-field
                  v-model="newPrescriptionData.patientFullName"
                  label="Patient Full Name"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="newPrescriptionData.medication"
                  label="Medication"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="newPrescriptionData.dosage"
                  label="Dosage"
                  required
                ></v-text-field>
                <v-textarea
                  v-model="newPrescriptionData.instructions"
                  label="Instructions"
                ></v-textarea>
                <v-btn type="submit" color="primary" class="mr-2">Create</v-btn>
                <v-btn @click="newPrescriptionDialog = false" color="secondary">Cancel</v-btn>
              </v-form>
              <!-- Error message for creating a new prescription -->
              <v-alert v-if="createError" type="error" class="mt-4">
                {{ createError }}
              </v-alert>
            </v-card-text>
          </v-card>
        </v-dialog>

        <!-- Search Bars -->
        <v-row class="mt-4">
          <v-col cols="12" md="6">
            <v-text-field
              v-model="searchMedication"
              label="Search by Medication"
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

        <!-- Table to display all prescriptions with pagination -->
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
          <template v-slot:item.actions="{ item }">
            <v-row no-gutters>
              <v-col>
                <v-btn @click="editPrescription(item)" color="primary" class="ma-2" block >Edit</v-btn>
              </v-col>
              <v-col>
                <v-btn @click="confirmDelete(item)" color="error" class="ma-2" block >Delete</v-btn>
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

        <!-- Dialog for editing a prescription -->
        <v-dialog v-model="editDialog" max-width="500">
          <v-card>
            <v-card-title>Edit Prescription</v-card-title>
            <v-card-text>
              <v-form @submit.prevent="updatePrescription">
                <v-text-field
                  v-model="editPrescriptionData.patientFullName"
                  label="Patient Full Name"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="editPrescriptionData.medication"
                  label="Medication"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="editPrescriptionData.dosage"
                  label="Dosage"
                  required
                ></v-text-field>
                <v-textarea
                  v-model="editPrescriptionData.instructions"
                  label="Instructions"
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
              You are about to delete the prescription for patient: <strong>{{ prescriptionToDelete?.patient.fullName }}</strong>. This action cannot be undone.
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="secondary" @click="deleteDialog = false">Cancel</v-btn>
              <v-btn color="error" @click="deletePrescriptionConfirmed">Delete</v-btn>
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
import api from "../utils/api";

const router = useRouter();

// Data for creating a new prescription
const newPrescriptionDialog = ref(false);
const newPrescriptionData = ref({
  patientFullName: '',
  medication: '',
  dosage: '',
  instructions: '',
});

// Error message for creating a new prescription
const createError = ref('');

// Data for editing a prescription
const editPrescriptionData = ref({
  id: null,
  patientFullName: '',
  medication: '',
  dosage: '',
  instructions: '',
});

// List of all prescriptions
const prescriptions = ref([]);

// Dialog state for editing
const editDialog = ref(false);

// Confirmation dialog state for deletion
const deleteDialog = ref(false);
const prescriptionToDelete = ref(null); // Stores the prescription to be deleted

// Search queries for filtering prescriptions
const searchPatientName = ref('');
const searchMedication = ref('');

// Pagination state
const currentPage = ref(1);
const itemsPerPage = ref(10); // Number of items per page
const totalPages = computed(() => Math.ceil(filteredPrescriptions.value.length / itemsPerPage.value));

// Loading state
const loading = ref(false);

// Table headers
const headers = [
  { title: 'ID', value: 'id' },
  { title: 'Patient Name', value: 'patient.fullName' },
  { title: 'Medication', value: 'medication' },
  { title: 'Dosage', value: 'dosage' },
  { title: 'Instructions', value: 'instructions' },
  { title: 'Actions', value: 'actions', sortable: false },
];

// Fetch all prescriptions on component mount
onMounted(() => {
  fetchPrescriptions();
});

// Fetch all prescriptions
const fetchPrescriptions = async () => {
  try {
    loading.value = true;
    const response = await api.get('/prescriptions');
    prescriptions.value = response.data.prescriptions;
  } catch (error) {
    console.error('Failed to fetch prescriptions:', error);
  } finally {
    loading.value = false;
  }
};

// Create a new prescription
const createNewPrescription = async () => {
  try {
    const response = await api.post('/prescriptions', newPrescriptionData.value);
    console.log('New prescription created:', response.data);

    // Close the dialog
    newPrescriptionDialog.value = false;

    // Refresh the prescriptions list
    fetchPrescriptions();

    // Reset the form data
    newPrescriptionData.value = {
      patientFullName: '',
      medication: '',
      dosage: '',
      instructions: '',
    };

    // Clear any previous error message
    createError.value = '';
  } catch (error) {
    console.error('Failed to create new prescription:', error);
    // Set the error message
    createError.value = error.response?.data?.message || 'Failed to create prescription. Please try again.';
  }
};

// Filter prescriptions based on search queries
const filteredPrescriptions = computed(() => {
  let filtered = prescriptions.value;

  // Filter by patient name
  if (searchPatientName.value) {
    filtered = filtered.filter((prescription) =>
      prescription.patient.fullName.toLowerCase().includes(searchPatientName.value.toLowerCase())
    );
  }

  // Filter by medication
  if (searchMedication.value) {
    filtered = filtered.filter((prescription) =>
      prescription.medication.toLowerCase().includes(searchMedication.value.toLowerCase())
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

// Open edit dialog with prescription data
const editPrescription = (prescription) => {
  editPrescriptionData.value = {
    ...prescription,
    patientFullName: prescription.patient.fullName || '', // Initialize patientFullName
  };
  editDialog.value = true;
};

// Update a prescription
const updatePrescription = async () => {
  try {
    const response = await api.put(`/prescriptions/${editPrescriptionData.value.id}`, editPrescriptionData.value);
    const updatedPrescription = response.data.updated;

    // Find the index of the updated prescription in the prescriptions array
    const index = prescriptions.value.findIndex((p) => p.id === updatedPrescription.id);

    if (index !== -1) {
      // Update the prescription in the array
      prescriptions.value[index] = {
        ...updatedPrescription,
        patientFullName: updatedPrescription.patient?.fullName || "Unknown", // Ensure patientFullName is preserved
      };
    }

    editDialog.value = false;
  } catch (error) {
    console.error('Failed to update prescription:', error);
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
    prescriptions.value = prescriptions.value.filter((p) => p.id !== prescriptionToDelete.value.id);
  } catch (error) {
    console.error('Failed to delete prescription:', error);
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
