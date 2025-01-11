<template>
  <v-container>
    <v-card>
      <v-card-title>Create New Medical Record</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="createMedicalRecord">
          <v-text-field v-model="newRecord.patientId" label="Patient ID" required></v-text-field>
          <v-text-field v-model="newRecord.diagnosis" label="Diagnosis" required></v-text-field>
          <v-textarea v-model="newRecord.notes" label="Notes"></v-textarea>
          <v-btn type="submit" color="primary">Create Medical Record</v-btn>
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

const newRecord = ref({
  patientId: null,
  diagnosis: '',
  notes: '',
});

const createMedicalRecord = async () => {
  try {
    const response = await api.post('/medical-records', newRecord.value);
    router.push({ name: 'record' }); // Redirect to the medical records list after creation
  } catch (error) {
    console.error('Failed to create medical record:', error);
  }
};

const cancel = () => {
  router.push({ name: 'record' }); // Redirect back to the medical records list
};
</script>
