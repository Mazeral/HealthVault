<template>
  <v-container>
    <!-- Statistics Section -->
    <v-row>
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Today's Patients</v-card-title>
          <v-card-text>{{ statistics.today }}</v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Monthly Patients</v-card-title>
          <v-card-text>{{ statistics.monthly }}</v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Yearly Patients</v-card-title>
          <v-card-text>{{ statistics.yearly }}</v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- New Patient Button -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-btn color="primary" @click="navigateToNewPatient">New Patient</v-btn>
      </v-col>
    </v-row>

    <!-- Search and Filter Controls -->
    <v-row class="mt-4">
      <v-col cols="12" md="6">
        <v-text-field
          v-model="searchQuery"
          label="Search by Full Name"
          outlined
          dense
          @input="handleSearchInput"
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="selectedBloodGroup"
          :items="bloodGroupOptions"
          label="Filter by Blood Group"
          outlined
          item-title="text"
          dense
          clearable
        ></v-select>
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="selectedSex"
          :items="sexOptions"
          label="Filter by Sex"
          outlined
          item-title="text"
          dense
          clearable
        ></v-select>
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="sortBy"
          :items="sortOptions"
          label="Sort By"
          outlined
          dense
        ></v-select>
      </v-col>
    </v-row>

    <!-- Patients Table with Pagination -->
    <v-data-table
      :headers="headers"
      :items="filteredPatients"
      :items-per-page="itemsPerPage"
      :page.sync="currentPage"
      :search="searchQuery"
      :loading="loading"
      loading-text="Loading... Please wait"
      hide-default-footer
    >
      <template v-slot:item.fullName="{ item }">
        {{ item.fullName }}
      </template>
      <template v-slot:item.sex="{ item }">
        {{ formatSex(item.sex) }}
      </template>
      <template v-slot:item.bloodGroup="{ item }">
        {{ formatBloodGroup(item.bloodGroup) }}
      </template>
      <template v-slot:item.dateOfBirth="{ item }">
        {{ formatDate(item.dateOfBirth) }}
      </template>
      <template v-slot:item.age="{ item }">
        {{ calculateAge(item.dateOfBirth) }}
      </template>
      <template v-slot:item.createdAt="{ item }">
        {{ formatDate(item.createdAt) }}
      </template>
      <template v-slot:item.actions="{ item }">
        <v-btn @click="editPatient(item)" color="primary" small>Edit</v-btn>
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

    <!-- Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="headline">Are you sure?</v-card-title>
        <v-card-text>
          You are about to delete the patient: <strong>{{ patientToDelete?.fullName }}</strong>. This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="secondary" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="deletePatientConfirmed">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit Dialog -->
    <v-dialog v-model="editDialog" max-width="500">
      <v-card>
        <v-card-title>Edit Patient</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="updatePatient">
            <v-text-field v-model="editPatientData.fullName" label="Full Name" required></v-text-field>
            <v-text-field v-model="editPatientData.dateOfBirth" label="Date of Birth" type="date" required></v-text-field>
            <v-text-field v-model="editPatientData.phone" label="Phone"></v-text-field>
            <v-text-field v-model="editPatientData.email" label="Email"></v-text-field>
            <v-text-field v-model="editPatientData.address" label="Address"></v-text-field>
            <v-select
              v-model="editPatientData.sex"
              :items="sexOptions"
              label="Sex"
              required
              item-title="text"
            ></v-select>
            <v-select
              v-model="editPatientData.bloodGroup"
              :items="bloodGroupOptions"
              label="Blood Group"
              required
              item-title="text"
            ></v-select>
            <v-btn type="submit" color="primary">Update</v-btn>
            <v-btn @click="editDialog = false" color="secondary">Cancel</v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import api from "../utils/api";

const router = useRouter();
const patients = ref([]); // Original list of patients
const statistics = ref({ today: 0, monthly: 0, yearly: 0 });
const searchQuery = ref('');
const selectedBloodGroup = ref(null); // Selected blood group for filtering
const selectedSex = ref(null); // Selected sex for filtering
const sortBy = ref('Newest Creation'); // Default sorting by newest creation
const sortOptions = ['Newest Creation', 'Oldest Creation', 'Youngest', 'Oldest']; // Sorting options

// Pagination state
const currentPage = ref(1);
const itemsPerPage = ref(10); // Number of items per page
const totalPages = computed(() => Math.ceil(filteredPatients.value.length / itemsPerPage.value));

// Loading state
const loading = ref(false);

// Confirmation dialog state
const deleteDialog = ref(false);
const patientToDelete = ref(null); // Stores the patient to be deleted

// Edit dialog state
const editDialog = ref(false);
const editPatientData = ref({
  id: null,
  fullName: '',
  dateOfBirth: '',
  phone: '',
  email: '',
  address: '',
  sex: '',
  bloodGroup: '',
});

// Blood group options for the v-select
const bloodGroupOptions = [
  { text: 'A+', value: 'A_PLUS' },
  { text: 'A-', value: 'A_MINUS' },
  { text: 'B+', value: 'B_PLUS' },
  { text: 'B-', value: 'B_MINUS' },
  { text: 'AB+', value: 'AB_PLUS' },
  { text: 'AB-', value: 'AB_MINUS' },
  { text: 'O+', value: 'O_PLUS' },
  { text: 'O-', value: 'O_MINUS' },
];

// Sex options for the v-select
const sexOptions = [
  { text: 'Male', value: 'MALE' },
  { text: 'Female', value: 'FEMALE' },
];

const headers = [
  { title: 'ID', value: 'id' },
  { title: 'Full Name', value: 'fullName' },
  { title: 'Gender', value: 'sex' },
  { title: 'Blood Group', value: 'bloodGroup' },
  { title: 'Date of Birth', value: 'dateOfBirth' },
  { title: 'Age', value: 'age' },
  { title: 'Created At', value: 'createdAt' },
  { title: 'Actions', value: 'actions', sortable: false },
];

// Fetch all patients from the backend
const fetchPatients = async () => {
  try {
    loading.value = true;
    const response = await api.get('/patients');
    patients.value = response.data.data;
  } catch (error) {
    console.error('Failed to fetch patients:', error);
  } finally {
    loading.value = false;
  }
};

// Fetch statistics from the backend
const fetchStatistics = async () => {
  try {
    const response = await api.get('/patients/statistics');
    statistics.value = response.data;
  } catch (error) {
    console.error('Failed to fetch statistics:', error);
  }
};

// Calculate age from date of birth
const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Format sex for display
const formatSex = (sex) => {
  return sex === 'MALE' ? 'Male' : 'Female';
};

// Format blood group for display
const formatBloodGroup = (bloodGroup) => {
  const bloodGroupMap = {
    'A_PLUS': 'A+',
    'A_MINUS': 'A-',
    'B_PLUS': 'B+',
    'B_MINUS': 'B-',
    'AB_PLUS': 'AB+',
    'AB_MINUS': 'AB-',
    'O_PLUS': 'O+',
    'O_MINUS': 'O-',
  };
  return bloodGroupMap[bloodGroup] || bloodGroup;
};

// Format date to dd/mm/yyyy
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Filter and sort patients based on search query, selected blood group, selected sex, and sort criteria
const filteredPatients = computed(() => {
  let filtered = patients.value;

  // Filter by search query (starts with)
  if (searchQuery.value) {
    filtered = filtered.filter((patient) =>
      patient.fullName.toLowerCase().startsWith(searchQuery.value.toLowerCase())
    );
  }

  // Filter by selected blood group
  if (selectedBloodGroup.value) {
    filtered = filtered.filter(
      (patient) => patient.bloodGroup === selectedBloodGroup.value
    );
  }

  // Filter by selected sex
  if (selectedSex.value) {
    filtered = filtered.filter(
      (patient) => patient.sex === selectedSex.value
    );
  }

  // Sort the filtered patients
  if (sortBy.value === 'Newest Creation') {
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Newest first
  } else if (sortBy.value === 'Oldest Creation') {
    filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // Oldest first
  } else if (sortBy.value === 'Youngest') {
    filtered.sort((a, b) => calculateAge(a.dateOfBirth) - calculateAge(b.dateOfBirth)); // Youngest first
  } else if (sortBy.value === 'Oldest') {
    filtered.sort((a, b) => calculateAge(b.dateOfBirth) - calculateAge(a.dateOfBirth)); // Oldest first
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

// Open edit dialog with patient data
const editPatient = (patient) => {
  editPatientData.value = { ...patient };
  editDialog.value = true;
};

// Update a patient
const updatePatient = async () => {
  try {
    const response = await api.put(`/patients/${editPatientData.value.id}`, editPatientData.value);
    const updatedPatient = response.data.updated;
    const index = patients.value.findIndex((p) => p.id === updatedPatient.id);
    if (index !== -1) {
      patients.value[index] = updatedPatient;
    }
    editDialog.value = false; // Close the dialog
  } catch (error) {
    console.error('Failed to update patient:', error);
  }
};

// Open confirmation dialog for deletion
const confirmDelete = (patient) => {
  patientToDelete.value = patient;
  deleteDialog.value = true;
};

// Delete a patient after confirmation
const deletePatientConfirmed = async () => {
  try {
    await api.delete(`/patients/${patientToDelete.value.id}`);
    fetchPatients(); // Refresh the list after deletion
  } catch (error) {
    console.error('Failed to delete patient:', error);
  } finally {
    deleteDialog.value = false; // Close the dialog
  }
};

// Fetch data on component mount
onMounted(() => {
  fetchPatients();
  fetchStatistics();
});
</script>
