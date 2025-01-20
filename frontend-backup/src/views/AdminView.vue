<template>
  <v-container>
    <v-card>
      <v-card-title>Manage Doctors</v-card-title>
      <v-card-text>
        <!-- Search Bar -->
        <v-row class="mt-4">
          <v-col cols="12" md="6">
            <v-text-field
              v-model="searchQuery"
              label="Search by Name or Email"
              outlined
              dense
              @input="handleSearchInput"
            ></v-text-field>
          </v-col>
        </v-row>

        <!-- Table to display all DOCTOR users -->
        <v-table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="doctor in filteredDoctors"
              :key="doctor.id"
              @click="showDoctorDetails(doctor)"
            >
              <td>{{ doctor.id }}</td>
              <td>{{ doctor.name }}</td>
              <td>{{ doctor.email }}</td>
              <td>{{ doctor.role }}</td>
              <td>{{ formatDate(doctor.createdAt) }}</td>
              <td>
                <v-btn @click.stop="editDoctor(doctor)" color="warning">Edit</v-btn>
                <v-btn @click.stop="confirmDelete(doctor)" color="error">Delete</v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>

        <!-- Doctor Details Dialog -->
        <v-dialog v-model="doctorDetailsDialog" max-width="800">
          <v-card>
            <v-card-title>Doctor Details</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <h3>Name: {{ selectedDoctor?.name }}</h3>
                  <h3>Email: {{ selectedDoctor?.email }}</h3>
                  <h3>Role: {{ selectedDoctor?.role }}</h3>
                  <h3>Created At: {{ formatDate(selectedDoctor?.createdAt) }}</h3>
                </v-col>
                <v-col cols="12" md="6">
                  <!-- Graph Component -->
                  <DoctorGraph :data="graphData" />
                </v-col>
              </v-row>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn @click="doctorDetailsDialog = false" color="secondary">Close</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- Edit Dialog -->
        <v-dialog v-model="editDialog" max-width="500">
          <v-card>
            <v-card-title>Edit Doctor</v-card-title>
            <v-card-text>
              <v-form @submit.prevent="updateDoctor">
                <v-text-field v-model="editDoctorData.name" label="Name" required></v-text-field>
                <v-text-field v-model="editDoctorData.email" label="Email" required></v-text-field>
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
              You are about to delete the doctor: <strong>{{ doctorToDelete?.name }}</strong>. This action cannot be undone.
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="secondary" @click="deleteDialog = false">Cancel</v-btn>
              <v-btn color="error" @click="deleteDoctorConfirmed">Delete</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../utils/api';
import DoctorGraph from '../components/DoctorGraph.vue'; // Import the graph component

// List of all DOCTOR users
const doctors = ref([]);

// Search query for filtering
const searchQuery = ref('');

// Edit dialog state
const editDialog = ref(false);
const editDoctorData = ref({
  id: null,
  name: '',
  email: '',
});

// Confirmation dialog state for deletion
const deleteDialog = ref(false);
const doctorToDelete = ref(null);

// Doctor details dialog state
const doctorDetailsDialog = ref(false);
const selectedDoctor = ref(null);
const graphData = ref({
  labels: ['Patients', 'Medical Records', 'Prescriptions', 'Lab Results'],
  datasets: [
    {
      label: 'Count',
      data: [0, 0, 0, 0], // Default data (all zeros)
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
    },
  ],
});

// Fetch all DOCTOR users on component mount
onMounted(() => {
  fetchDoctors();
});

// Fetch all DOCTOR users
const fetchDoctors = async () => {
  try {
    const response = await api.get('/users/doctors');
    doctors.value = response.data.doctors;
  } catch (error) {
    console.error('Failed to fetch doctors:', error);
  }
};

// Filter doctors based on search query
const filteredDoctors = computed(() => {
  if (!searchQuery.value) {
    return doctors.value; // Return all doctors if no search query
  }
  return doctors.value.filter((doctor) =>
    doctor.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    doctor.email.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// Handle search input
const handleSearchInput = () => {
  // No need to do anything here, computed property will handle filtering
};

// Open edit dialog with doctor data
const editDoctor = (doctor) => {
  editDoctorData.value = { ...doctor };
  editDialog.value = true;
};

// Update a doctor
const updateDoctor = async () => {
  try {
    const response = await api.put(`/users/doctors/${editDoctorData.value.id}`, editDoctorData.value);
    const updatedDoctor = response.data.updated;
    const index = doctors.value.findIndex((d) => d.id === updatedDoctor.id);
    if (index !== -1) {
      doctors.value[index] = updatedDoctor;
    }
    editDialog.value = false;
  } catch (error) {
    console.error('Failed to update doctor:', error);
  }
};

// Open confirmation dialog for deletion
const confirmDelete = (doctor) => {
  doctorToDelete.value = doctor;
  deleteDialog.value = true;
};

// Delete a doctor after confirmation
const deleteDoctorConfirmed = async () => {
  try {
    await api.delete(`/users/doctors/${doctorToDelete.value.id}`);
    doctors.value = doctors.value.filter((d) => d.id !== doctorToDelete.value.id);
  } catch (error) {
    console.error('Failed to delete doctor:', error);
  } finally {
    deleteDialog.value = false; // Close the dialog
  }
};

// Show doctor details and fetch data for the graph
const showDoctorDetails = async (doctor) => {
  try {
    selectedDoctor.value = doctor;

    // Fetch detailed data for the selected doctor
    const response = await api.get(`/users/doctors/${doctor.id}/details`);
    const { patients, medicalRecords, prescriptions, labResults } = response.data;

    // Update graph data
    graphData.value.datasets[0].data = [
      patients.length,
      medicalRecords.length,
      prescriptions.length,
      labResults.length,
    ];

    // Open the dialog
    doctorDetailsDialog.value = true;
  } catch (error) {
    console.error('Failed to fetch doctor details:', error);
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
</script>

<style scoped>
.v-table {
  margin-top: 20px;
}

/* Add hover effect to table rows */
.v-table tbody tr:hover {
  background-color: #f5f5f5; /* Light gray background on hover */
  cursor: pointer; /* Change cursor to pointer to indicate clickability */
}

/* Optional: Add a transition for smoother hover effect */
.v-table tbody tr {
  transition: background-color 0.2s ease;
}
</style>
