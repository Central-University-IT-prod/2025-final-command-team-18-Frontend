<template>
  <div class="min-h-screen bg-gray-900 text-yellow-300 p-4">
    <RouterLink 
      class="px-4 py-2 rounded-xl w-fit block absolute top-4 left-4 text-yellow-300 bg-gray-800 hover:bg-gray-700 transition" 
      to="/"
    >
      ← На главную
    </RouterLink>

    <p class="text-yellow-300 ml-2.5 mt-10 pt-4 pb-4 text-center text-lg font-bold">Лояльности Компании</p>

    <section class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[repeat(3,_230px)] text-wrap items-center justify-center gap-4 p-4">
      <div v-for="loyal in filteredLoyalties" :key="loyal.loyal_id"
          class="border-2 border-gray-500 bg-gray-700 text-yellow-300 shadow-xl rounded-2xl overflow-hidden backdrop-blur-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl w-full max-w-[300px] mx-auto"
          @click="$router.push('/loyalty/detailed/' + loyal.loyal_id)">
        <div class="p-4 text-lg font-semibold text-center border-b-2 border-gray-500">{{ loyal.name }}</div>
        <img class="w-full h-auto object-cover rounded-b-2xl" :src="loyal.banner" alt="Loyalty Image">
      </div>
    </section>
  </div>
</template>

<script setup>
import { RouterLink, useRouter, useRoute } from 'vue-router';
import { ref, onMounted, computed } from 'vue';
import modalQR from "@/components/modalQR.vue";
import { jwtDecode } from "jwt-decode";

// State for QR modal
const qr = ref({
  show: false,
  data: 'HelloWorld',
});

const router = useRouter();
const route = useRoute();

// Open QR modal with the user-specific data
function openQR() {
  const token = localStorage.getItem("client-token");

  if (token) {
    const decoded = jwtDecode(token);
    qr.value.data = `individual/${decoded['user_id']}`;
    qr.value.show = true;
  } else {
    router.push('/client/login');
  }
}

// State for loyalty images
const loyaltyImages = ref([]);

// Fetch loyalty images on component mount
onMounted(async () => {
  try {
    const loyaltyResponse = await fetch(`${import.meta.env.VITE_BASE_URL}/loyal/loyalties`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!loyaltyResponse.ok) throw new Error('Ошибка при загрузке изображений лояльности');
    loyaltyImages.value = await loyaltyResponse.json();
  } catch (error) {
    console.error('Ошибка загрузки изображений лояльности:', error);
  }
});

// Filter loyalties based on the company_id from the route
const filteredLoyalties = computed(() => {
  const companyIdFromUrl = route.params.id; // get company_id from URL
  return loyaltyImages.value.filter(loyal => loyal.company_id === companyIdFromUrl);
});
</script>



<style lang="scss" scoped>

</style>