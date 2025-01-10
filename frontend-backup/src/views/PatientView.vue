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
import api from "../utils/api"

const patients = ref([]);
const headers = [
  { title: 'ID', value: 'id' },
  { title: 'First Name', value: 'firstName' },
  { title: 'Last Name', value: 'lastName' },
  { title: 'Actions', value: 'actions', sortable: false },
];

const fetchPatients = async () => {
  try {
    const response = await api.get('/patients');
	console.log(response.data.data)
    patients.value = response.data.data; // Corrected this line
  } catch (error) {
    console.error('Failed to fetch patients:', error);
  }
};

onMounted(() => {
  fetchPatients();
});

const editPatient = (patient) => {
  // Handle edit
};

const deletePatient = async (patient) => {
  try {
    await api.delete(`/patients/${patient.id}`);
    fetchPatients();
  } catch (error) {
    console.error('Failed to delete patient:', error);
  }
};
</script>
