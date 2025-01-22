<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Patients Per Day</v-card-title>
          <v-card-text>
            <BarChart :data="patientsPerDayData" />
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Metrics</v-card-title>
          <v-card-text>
            <PieChart :data="metricsData" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../utils/api';
import BarChart from '../components/BarChart.vue';
import PieChart from '../components/PieChart.vue';

// Data for charts
const patientsPerDayData = ref({
  labels: [],
  datasets: [
    {
      label: 'Patients Per Day',
      data: [],
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
    },
  ],
});

const metricsData = ref({
  labels: [],
  datasets: [
    {
      label: 'Metrics',
      data: [],
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
      ],
      borderWidth: 1,
    },
  ],
});

// Fetch data on mount
onMounted(async () => {
  try {
    // Fetch patients per day
    const patientsPerDayResponse = await api.get('/dashboard/patients-per-day');
    const patientsPerDay = patientsPerDayResponse.data.patientsPerDay;

    patientsPerDayData.value.labels = patientsPerDay.map((item) => item.date);
    patientsPerDayData.value.datasets[0].data = patientsPerDay.map((item) => item.count);

    // Fetch metrics
    const metricsResponse = await api.get('/dashboard');
    const metrics = metricsResponse.data.metrics;

    metricsData.value.labels = metrics.map((item) => item.title);
    metricsData.value.datasets[0].data = metrics.map((item) => item.value);
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
  }
});
</script>
