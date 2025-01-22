<template>
  <v-container>
    <v-form @submit.prevent="savePatient">
      <!-- Full Name -->
      <v-text-field v-model="patient.fullName" label="Full Name"></v-text-field>

      <!-- Date of Birth -->
      <v-text-field v-model="patient.dateOfBirth" label="Date of Birth" type="date"></v-text-field>

      <!-- Phone -->
      <v-text-field v-model="patient.phone" label="Phone"></v-text-field>

      <!-- Email -->
      <v-text-field v-model="patient.email" label="Email"></v-text-field>

      <!-- Address -->
      <v-text-field v-model="patient.address" label="Address"></v-text-field>

      <!-- Sex (Dropdown) -->
      <v-select
        v-model="patient.sex"
        :items="sexOptions"
        label="Sex"
        item-title="label"
        item-value="value"
      ></v-select>

      <!-- Blood Group (Dropdown) -->
      <v-select
        v-model="patient.bloodGroup"
        :items="bloodGroupOptions"
        label="Blood Group"
        item-title="label"
        item-value="value"
      ></v-select>

      <!-- Save Button -->
      <v-btn type="submit">Save</v-btn>
    </v-form>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../utils/api';

const route = useRoute(); // Access route params
const router = useRouter(); // Navigate after saving

// Define the patient object with the new schema fields
const patient = ref({
  fullName: '',
  dateOfBirth: '',
  phone: '',
  email: '',
  address: '',
  sex: '',
  bloodGroup: '',
});

// Options for the sex dropdown
const sexOptions = [
  { label: 'Male', value: 'MALE' },
  { label: 'Female', value: 'FEMALE' },
];

// Options for the blood group dropdown
const bloodGroupOptions = [
  { label: 'A+', value: 'A_PLUS' },
  { label: 'A-', value: 'A_MINUS' },
  { label: 'B+', value: 'B_PLUS' },
  { label: 'B-', value: 'B_MINUS' },
  { label: 'AB+', value: 'AB_PLUS' },
  { label: 'AB-', value: 'AB_MINUS' },
  { label: 'O+', value: 'O_PLUS' },
  { label: 'O-', value: 'O_MINUS' },
];

// Fetch the patient data when the component is mounted
onMounted(async () => {
  try {
    const response = await api.get(`/patient/${route.params.id}`);
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
