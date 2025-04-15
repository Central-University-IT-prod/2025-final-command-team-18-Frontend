<template>
  <div class="min-h-screen bg-gray-900 text-yellow-300 p-4">
    <RouterLink 
      class="px-4 py-2 rounded-xl w-fit block absolute top-4 left-4 text-yellow-300 bg-gray-800 hover:bg-gray-700 transition" 
      to="/"
    >
      ← На главную
    </RouterLink>

    <div class="pt-12 px-6 mt-10 lg:mt-0">
      <!-- Модальное окно с QR-кодом -->
      <modalQR v-if="qr.show" :title="'QR-код'" :data="qr.data" @close="qr.show=false"></modalQR>

      <!-- Баннер лояльности -->
      <img
        class="bg-gray-700 justify-self-center text-yellow-300 shadow-2xl rounded-3xl w-fit mx-auto mb-8"
        :src="loyalty.banner"
        alt="Loyalty Image"
      />

      <!-- Описание лояльности -->
      <section>
        <div v-if="loyalty.description" class="m-6 p-6 text-lg bg-gray-800 text-yellow-300 rounded-2xl shadow-lg">
          <p class="text-center text-xl font-semibold mb-4">Описание</p>
          <p class="text-justify leading-relaxed">{{ loyalty.description }}</p>
        </div>
      </section>

      <!-- Кнопка открытия QR-кода -->
      <div class="flex justify-center items-center mt-8">
        <button 
          @click="openQR" 
          class="px-8 py-4 rounded-2xl text-md font-semibold text-yellow-300 bg-gray-700 border-3 border-yellow-300 transition-all duration-300 ease-in-out hover:bg-yellow-300 hover:text-black active:scale-95 active:bg-yellow-400">
          Открыть QR
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router';
import { onBeforeMount, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import modalQR from "@/components/modalQR.vue";

const qr = ref({
  show: false,
  data: ''
});
const router = useRouter();
const route = useRoute();

let loyalty = ref({});

function openQR(){
  let token = localStorage.getItem("client-token");

  if (token !== null){
    qr.value.data = 'loyal/'+token+'/'+route.params.id;
    qr.value.show = true;
  } else{
    router.push('/client/login');
  }
}

onBeforeMount(async () => {
  // Загрузка лояльности с бэкенда
  try {
    const loyaltyResponse = await fetch(`${import.meta.env.VITE_BASE_URL}/loyal/loyalty/`+route.params.id, {
      method: "GET"
    });
    if (!loyaltyResponse.ok) throw new Error("Ошибка при загрузке изображений лояльности");
    loyalty.value = await loyaltyResponse.json();
    console.log(loyalty.value);
  } catch (error) {
    console.error("Ошибка загрузки изображений лояльности:", error);
  }
});
</script>