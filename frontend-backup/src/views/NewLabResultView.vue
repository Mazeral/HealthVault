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

const createLabResult = async () => {
  try {
    const response = await api.post('/lab-results', newLabResult.value);
    router.push({ name: 'lab' }); // Redirect to the lab results list after creation
  } catch (error) {
    console.error('Failed to create lab result:', error);
  }
};

const cancel = () => {
  router.push({ name: 'lab' }); // Redirect back to the lab results list
};
</script>
