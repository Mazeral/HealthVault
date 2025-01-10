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

    <!-- Search and Sort Controls -->
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
          @change="sortPatients"
        ></v-select>
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="sortOrder"
          :items="['Ascending', 'Descending']"
          label="Sort Order"
          outlined
          dense
          @change="sortPatients"
        ></v-select>
      </v-col>
    </v-row>

    <!-- Patients Table -->
    <v-data-table :items="filteredPatients" :headers="headers">
      <template v-slot:item.fullName="{ item }">
        <v-btn text @click="viewPatient(item)">{{ item.fullName }}</v-btn>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-btn @click="editPatient(item)">Edit</v-btn>
        <v-btn @click="deletePatient(item)">Delete</v-btn>
      </template>
    </v-data-table>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from "../utils/api";

const router = useRouter();
const patients = ref([]); // Original list of patients
const statistics = ref({ today: 0, monthly: 0, yearly: 0 });
const searchQuery = ref('');
const sortBy = ref('Newest'); // Default sorting by newest
const sortOrder = ref('Descending'); // Default sort order
const sortOptions = ['Newest', 'Oldest', 'Gender']; // Sorting options
const selectedBloodGroup = ref(null);

const headers = [
  { title: 'ID', value: 'id' },
  { title: 'Full Name', value: 'fullName' },
  { title: 'Gender', value: 'sex' }, // Updated to use 'sex' instead of 'gender'
  { title: 'Blood Group', value: 'bloodGroup' },
  { title: 'Created At', value: 'createdAt' }, // Added createdAt column
  { title: 'Actions', value: 'actions', sortable: false },
];

// Blood groups
const bloodGroupOptions = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-',
];

// Fetch all patients from the backend
const fetchPatients = async () => {
  try {
    const response = await api.get('/patients');
    patients.value = response.data.data;
  } catch (error) {
    console.error('Failed to fetch patients:', error);
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

// Filter patients based on search query and selected blood group
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

  return filtered;
});

// Handle search input
const handleSearchInput = () => {
  // No need to do anything here, computed property will handle filtering
};

// Sort patients based on selected criteria
const sortPatients = () => {
  patients.value.sort((a, b) => {
    if (sortBy.value === 'newest') {
      return sortOrder.value === 'Ascending'
        ? new Date(a.createdAt) - new Date(b.createdAt) // Oldest first
        : new Date(b.createdAt) - new Date(a.createdAt); // Newest first
    } else if (sortBy.value === 'oldest') {
      return sortOrder.value === 'Ascending'
        ? new Date(b.createdAt) - new Date(a.createdAt) // Newest first
        : new Date(a.createdAt) - new Date(b.createdAt); // Oldest first
    } else if (sortBy.value === 'sex') {
      return sortOrder.value === 'Ascending'
        ? a.sex.localeCompare(b.sex) // Sort by sex (gender) ascending
        : b.sex.localeCompare(a.sex); // Sort by sex (gender) descending
    }
    return 0;
  });
};

// Navigate to patient preview page
const viewPatient = (patient) => {
  router.push({ name: 'patient-preview', params: { id: patient.id } });
};

// Navigate to edit patient page
const editPatient = (patient) => {
  router.push({ name: 'edit-patient', params: { id: patient.id } });
};

// Delete a patient
const deletePatient = async (patient) => {
  try {
    await api.delete(`/patients/${patient.id}`);
    fetchPatients(); // Refresh the list after deletion
  } catch (error) {
    console.error('Failed to delete patient:', error);
  }
};

// Fetch data on component mount
onMounted(() => {
  fetchPatients();
  fetchStatistics();
});
</script>
