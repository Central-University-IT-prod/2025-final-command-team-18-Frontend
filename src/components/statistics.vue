<template>
  <div class="chart-container">
    <h2 v-if="error===''">Использование программ лояльности</h2>
    <p class="text-red-500 font-bold text-2xl" v-else>{{ error }}</p>
    <canvas ref="chartCanvasAct" v-if="data_act.length > 0"></canvas>
    <p class="text-xl font-bold text-center pt-4" v-else>Нет данных</p>
  </div>
  <div class="chart-container">
    <h2 v-if="error===''">Всего продано товаров</h2>
    <p class="text-red-500 font-bold text-2xl" v-else>{{ error }}</p>
    <canvas ref="chartCanvasProdAll" v-if="data_prod_all.length > 0"></canvas>
    <p class="text-xl font-bold text-center pt-4" v-else>Нет данных</p>
  </div>
</template>

<script setup>
import { onBeforeMount, ref } from 'vue';
import { jwtDecode } from "jwt-decode";
import Chart from 'chart.js/auto';

const chartCanvasAct = ref(null);
const chartCanvasProdAll = ref(null);

const error = ref('');
const data_act = ref([]);
const data_prod_all = ref([]);

onBeforeMount(async () => {
  let token = localStorage.getItem('business-token');
  if (!token || token === 'undefined'){
    return router.push('/compains/auth')
  }

  let decoded;
  try {
    decoded = jwtDecode(token);
  } catch (error) {
    console.error("Invalid token", error);
  }

  try {
    const loyaltyResponse = await fetch(`${import.meta.env.VITE_BASE_URL}/stats/${decoded['user_id']}/max/activated`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!loyaltyResponse.ok) throw new Error("Ошибка при загрузке изображений лояльности");
    data_act.value = await loyaltyResponse.json();
  } catch (error) {
    console.error("Ошибка загрузки изображений лояльности:", error);
  }
  try {
    const loyaltyResponse = await fetch(`${import.meta.env.VITE_BASE_URL}/stats/${decoded['user_id']}/count/product`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!loyaltyResponse.ok) throw new Error("Ошибка при загрузке изображений лояльности");
    data_prod_all.value = await loyaltyResponse.json();
  } catch (error) {
    console.error("Ошибка загрузки изображений лояльности:", error);
  }
  try {
    const loyaltyResponse = await fetch(`${import.meta.env.VITE_BASE_URL}/stats/${decoded['user_id']}/count/loyalty/product`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!loyaltyResponse.ok) throw new Error("Ошибка при загрузке изображений лояльности");
    data_prod.value = await loyaltyResponse.json();
  } catch (error) {
    console.error("Ошибка загрузки изображений лояльности:", error);
  }
  if (chartCanvasAct.value) {
    new Chart(chartCanvasAct.value, {
      type: 'bar',
      data: {
        labels: data_act.value.map(item => item.loyal_id),
        datasets: [{
          label: 'Программа лояльности',
          data: data_act.value.map(item => item.count)
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  if (chartCanvasProdAll.value) {
    new Chart(chartCanvasProdAll.value, {
      type: 'pie',
      data: {
        labels: data_prod_all.value.map(item => item.product_id),
        datasets: [{
          label: 'Продукт',
          data: data_prod_all.value.map(item => item.count),
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          }
        }
      }
    });
  }
});
</script>

<style scoped>
.chart-container {
  max-width: 600px;
  margin: auto;
  text-align: center;
}
</style>