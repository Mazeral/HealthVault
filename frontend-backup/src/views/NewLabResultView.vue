<template>
  <v-container>
    <v-card>
      <v-card-title>Create New Lab Result</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="createLabResult">
          <v-text-field v-model="newLabResult.patientId" label="Patient ID" required></v-text-field>
          <v-text-field v-model="newLabResult.testName" label="Test Name" required></v-text-field>
          <v-text-field v-model="newLabResult.result" label="Result" required></v-text-field>
          <v-text-field v-model="newLabResult.notes" label="Notes"></v-text-field>
          <v-text-field v-model="newLabResult.performedAt" label="Performed At" type="date" required></v-text-field>
          <v-btn type="submit" color="primary">Create Lab Result</v-btn>
          <v-btn @click="cancel" color="secondary">Cancel</v-btn>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- Success Snackbar -->
    <v-snackbar v-model="successSnackbar" :timeout="3000" color="success">
      Lab result created successfully!
      <template v-slot:actions>
        <v-btn @click="successSnackbar = false" color="white" variant="text">Close</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../utils/api';

const router = useRouter();

const newLabResult = ref({
  patientId: null,
  testName: '',
  result: '',
  notes: '',
  performedAt: '',
});

const successSnackbar = ref(false); // Controls the visibility of the success snackbar

const createLabResult = async () => {
  try {
    const response = await api.post('/lab-results', newLabResult.value);
    if (response.status === 200) {
      successSnackbar.value = true; // Show success message
      setTimeout(() => {
        router.push({ name: 'lab' }); // Redirect to the lab results list after a short delay
      }, 1000); // Wait 1 second before redirecting
    }
  } catch (error) {
    console.error('Failed to create lab result:', error);
  }
};

const cancel = () => {
  router.push({ name: 'lab' }); // Redirect back to the lab results list
};
</script>
