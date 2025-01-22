<template>
  <canvas ref="chart"></canvas>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// Define props
const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
});

// Reference to the chart canvas
const chart = ref(null);

// Chart instance
let chartInstance = null;

// Initialize or update the chart
const renderChart = () => {
  if (chartInstance) {
    chartInstance.destroy(); // Destroy existing chart instance
  }

  chartInstance = new Chart(chart.value, {
    type: 'bar',
    data: props.data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          enabled: true,
        },
      },
    },
  });
};

// Watch for changes in the data prop
watch(() => props.data, renderChart, { deep: true });

// Render the chart on mount
onMounted(renderChart);
</script>

<style scoped>
canvas {
  max-width: 100%;
  height: auto;
}
</style>
