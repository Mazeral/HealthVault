<template>
  <v-container>
    <v-data-table :items="patients" :headers="headers">
      <template v-slot:item.actions="{ item }">
        <v-btn @click="editPatient(item)">Edit</v-btn>
        <v-btn @click="deletePatient(item)">Delete</v-btn>
      </template>
    </v-data-table>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router'; // Import the router
import api from "../utils/api";

const router = useRouter(); // Initialize the router
const patients = ref([]);
const headers = [
  { title: 'ID', value: 'id' },
  { title: 'Full Name', value: 'fullName' },
  { title: 'Actions', value: 'actions', sortable: false },
];

const fetchPatients = async () => {
  try {
    const response = await api.get('/patients');
    patients.value = response.data.data;
  } catch (error) {
    console.error('Failed to fetch patients:', error);
  }
};

onMounted(() => {
  fetchPatients();
});

const editPatient = (patient) => {
  // Navigate to the edit view with the patient ID
  router.push({ name: 'edit-patient', params: { id: patient.id } });
};

const deletePatient = async (patient) => {
  try {
    await api.delete(`/patients/${patient.id}`);
    fetchPatients(); // Refresh the list after deletion
  } catch (error) {
    console.error('Failed to delete patient:', error);
  }
};
</script>
