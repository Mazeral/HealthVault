<template>
  <v-container>
    <v-form @submit.prevent="savePatient">
      <v-text-field v-model="patient.firstName" label="First Name"></v-text-field>
      <v-text-field v-model="patient.lastName" label="Last Name"></v-text-field>
      <v-text-field v-model="patient.dateOfBirth" label="Date of Birth" type="date"></v-text-field>
      <v-text-field v-model="patient.phone" label="Phone"></v-text-field>
      <v-text-field v-model="patient.email" label="Email"></v-text-field>
      <v-text-field v-model="patient.address" label="Address"></v-text-field>
      <v-btn type="submit">Save</v-btn>
    </v-form>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from "../utils/api";

const route = useRoute(); // Access route params
const router = useRouter(); // Navigate after saving
const patient = ref({
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  phone: '',
  email: '',
  address: '',
});

// Fetch the patient data when the component is mounted
onMounted(async () => {
  try {
    const response = await api.get(`/patients/${route.params.id}`);
    patient.value = response.data.patient;
  } catch (error) {
    console.error('Failed to fetch patient:', error);
  }
});

// Save the updated patient data
const savePatient = async () => {
  try {
    await api.put(`/patients/${route.params.id}`, patient.value);
    router.push({ name: 'patients' }); // Navigate back to the patient list
  } catch (error) {
    console.error('Failed to update patient:', error);
  }
};
</script>
