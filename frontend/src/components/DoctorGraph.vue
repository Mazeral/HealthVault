<template>
  <div>
    <!-- Show "No data available" message if data is empty -->
    <div v-if="!hasData" class="no-data-message">
      No data available
    </div>

    <!-- Render the chart only if data is available -->
    <canvas v-else ref="chart"></canvas>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { Chart, PieController, ArcElement, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
Chart.register(PieController, ArcElement, Tooltip, Legend);

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

// Check if there is any data to display
const hasData = computed(() => {
  return props.data.datasets[0].data.some((value) => value > 0);
});

// Initialize or update the chart
const renderChart = () => {
  if (chartInstance) {
    chartInstance.destroy(); // Destroy existing chart instance
  }

  chartInstance = new Chart(chart.value, {
    type: 'pie',
    data: props.data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
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
onMounted(() => {
  if (hasData.value) {
    renderChart();
  }
});
</script>

<style scoped>
canvas {
  max-width: 100%;
  height: auto;
}

.no-data-message {
  text-align: center;
  font-size: 1.2rem;
  color: #888;
  padding: 20px;
  border: 1px dashed #ccc;
  border-radius: 4px;
  background-color: #f9f9f9;
}
</style>
