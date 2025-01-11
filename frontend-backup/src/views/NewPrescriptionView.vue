<template>
  <v-container>
    <v-card>
      <v-card-title>Create New Prescription</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="createPrescription">
          <v-text-field v-model="newPrescription.fullName" label="Patient Full Name" required></v-text-field>
          <v-text-field v-model="newPrescription.medication" label="Medication" required></v-text-field>
          <v-text-field v-model="newPrescription.dosage" label="Dosage" required></v-text-field>
          <v-textarea v-model="newPrescription.instructions" label="Instructions"></v-textarea>
          <v-btn type="submit" color="primary">Create Prescription</v-btn>
          <v-btn @click="cancel" color="secondary">Cancel</v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../utils/api';

const router = useRouter();

const newPrescription = ref({
  fullName: '',
  medication: '',
  dosage: '',
  instructions: '',
});

const createPrescription = async () => {
  try {
    const response = await api.post('/prescriptions', newPrescription.value);
    router.push({ name: 'prescription' }); // Redirect to the prescriptions list after creation
  } catch (error) {
    console.error('Failed to create prescription:', error);
  }
};

const cancel = () => {
  router.push({ name: 'prescription' }); // Redirect back to the prescriptions list
};
</script>
