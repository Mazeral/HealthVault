<template>
  <v-container>
    <!-- Key Metrics -->
    <v-row>
      <v-col cols="12" md="3" v-for="metric in metrics" :key="metric.title">
        <v-card>
          <v-card-title>{{ metric.title }}</v-card-title>
          <v-card-text>
            <h2>{{ metric.value }}</h2>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Quick Links -->
    <v-row class="mt-4">
      <v-col
		cols="12" md="3" 
		v-for="link in quickLinks"
		  :key="link.text">
        <v-btn
          :to="link.to"
          block
          color="primary"
          class="custom-btn" 
		  size="large"
        >
          {{ link.text }}
        </v-btn>
      </v-col>
    </v-row>

    <!-- Recent Activity -->
    <v-row class="mt-4">
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Recent Patients</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item v-for="patient in recentPatients" :key="patient.id">
                <v-list-item-title>{{ patient.firstName }} {{ patient.lastName }}</v-list-item-title>
                <v-list-item-subtitle>{{ formatDate(patient.createdAt) }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Recent Lab Results</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item v-for="labResult in recentLabResults" :key="labResult.id">
                <v-list-item-title>{{ labResult.testName }}</v-list-item-title>
                <v-list-item-subtitle>{{ formatDate(labResult.createdAt) }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Charts -->
    <v-row class="mt-4">
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Patient Demographics</v-card-title>
          <v-card-text>
            <PieChart :data="patientDemographics" />
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Prescription Trends</v-card-title>
          <v-card-text>
            <BarChart :data="prescriptionTrends" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../utils/api';
import PieChart from '../components/PieChart.vue'; // Example chart component
import BarChart from '../components/BarChart.vue'; // Example chart component

// Key metrics
const metrics = ref([
  { title: 'Total Patients', value: 0 },
  { title: 'Total Medical Records', value: 0 },
  { title: 'Total Prescriptions', value: 0 },
  { title: 'Total Lab Results', value: 0 },
]);

// Quick links
const quickLinks = ref([
  { text: 'View Patients', to: '/patients' },
  { text: 'Add Medical Record', to: '/record' },
  { text: 'Add Prescription', to: '/prescription' },
  { text: 'Add Lab Result', to: '/lab' },
]);

// Recent activity
const recentPatients = ref([]);
const recentLabResults = ref([]);

// Chart data
const patientDemographics = ref({
  labels: ['Male', 'Female', 'Other'],
  datasets: [{ data: [60, 35, 5] }],
});

const prescriptionTrends = ref({
  labels: ['Medication A', 'Medication B', 'Medication C'],
  datasets: [{ data: [20, 15, 10] }],
});

// Format date
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};

// Fetch data on mount
onMounted(async () => {
  try {
    const response = await api.get('/dashboard');
    metrics.value = response.data.metrics;
    recentPatients.value = response.data.recentPatients;
    recentLabResults.value = response.data.recentLabResults;
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
  }
});
</script>

<style scoped>
.v-card {
  height: 100%;
}

.custom-btn {
  white-space: normal !important; /* Allow text to wrap */
  word-wrap: break-word !important;
  font-size: 0.63rem !important; /* Adjust font size */
  line-height: 1.5 !important; /* Adjust line height for better wrapping */
  padding: 10px 16px !important; /* Add padding for better spacing */
  height: auto !important; /* Allow height to adjust based on content */
}
</style>
