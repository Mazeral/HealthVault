<template>
  <v-container>
    <v-card>
      <v-card-title>Prescriptions</v-card-title>
      <v-card-text>
        <!-- Button to navigate to the new prescription view -->
        <v-btn @click="navigateToNewPrescription" color="primary" class="mb-4">New Prescription</v-btn>

        <!-- Search Bar -->
        <v-row class="mt-4">
          <v-col cols="12" md="6">
            <v-text-field
              v-model="searchQuery"
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
            <v-btn @click="editPrescription(item)" color="warning" small>Edit</v-btn>
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

        <!-- Dialog for editing a prescription -->
        <v-dialog v-model="editDialog" max-width="500">
          <v-card>
            <v-card-title>Edit Prescription</v-card-title>
            <v-card-text>
              <v-form @submit.prevent="updatePrescription">
                <v-text-field v-model="editPrescriptionData.patientId" label="Patient ID" type="number" required></v-text-field>
                <v-text-field v-model="editPrescriptionData.medication" label="Medication" required></v-text-field>
                <v-text-field v-model="editPrescriptionData.dosage" label="Dosage" required></v-text-field>
                <v-textarea v-model="editPrescriptionData.instructions" label="Instructions"></v-textarea>
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
import api from "../utils/api"

const router = useRouter();

// Data for editing a prescription
const editPrescriptionData = ref({
  id: null,
  patientId: null,
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

// Search query for filtering prescriptions
const searchQuery = ref('');

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

// Filter prescriptions based on search query
const filteredPrescriptions = computed(() => {
  if (!searchQuery.value) {
    return prescriptions.value; // Return all prescriptions if no search query
  }
  return prescriptions.value.filter((prescription) =>
    prescription.patient.fullName.toLowerCase().includes(searchQuery.value.toLowerCase())
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

// Open edit dialog with prescription data
const editPrescription = (prescription) => {
  editPrescriptionData.value = { ...prescription };
  editDialog.value = true;
};

// Update a prescription
const updatePrescription = async () => {
  try {
    const response = await api.put(`/prescriptions/${editPrescriptionData.value.id}`, editPrescriptionData.value);
    const index = prescriptions.value.findIndex((p) => p.id === editPrescriptionData.value.id);
    if (index !== -1) {
      prescriptions.value[index] = response.data.updated;
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

// Navigate to the new prescription view
const navigateToNewPrescription = () => {
  router.push({ name: 'new-prescription' });
};
</script>

<style scoped>
.v-table {
  margin-top: 20px;
}
</style>
