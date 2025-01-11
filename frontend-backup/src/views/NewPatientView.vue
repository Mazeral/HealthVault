<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>Create New Patient</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="createPatient">
              <v-text-field v-model="newPatient.fullName" label="Full Name" required></v-text-field>
              <v-text-field v-model="newPatient.dateOfBirth" label="Date of Birth" type="date" required></v-text-field>
              <v-text-field v-model="newPatient.phone" label="Phone"></v-text-field>
              <v-text-field v-model="newPatient.email" label="Email"></v-text-field>
              <v-text-field v-model="newPatient.address" label="Address"></v-text-field>
              <v-select v-model="newPatient.sex" :items="sexOptions" item-title="text" label="Sex" required></v-select>
              <v-select v-model="newPatient.bloodGroup" :items="bloodGroupOptions" item-title="text" label="Blood Group" required></v-select>
              <v-btn type="submit" color="primary">Create Patient</v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from "../utils/api";

const router = useRouter();

const newPatient = ref({
  fullName: '',
  dateOfBirth: '',
  phone: '',
  email: '',
  address: '',
  sex: '',
  bloodGroup: '',
});

const sexOptions = [
  { text: 'Male', value: 'MALE' },
  { text: 'Female', value: 'FEMALE' },
];

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

const createPatient = async () => {
  try {
    await api.post('/patients', newPatient.value);
    router.push({ name: 'patients' }); // Redirect to the patients list after creation
  } catch (error) {
    console.error('Failed to create patient:', error);
  }
};
</script>
