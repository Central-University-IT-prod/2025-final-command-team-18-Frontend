<template>
  <div class="min-h-screen flex flex-col bg-gray-900 text-white">
    <modalQR v-if="qr.show" :title="'Ваш QR-код'" :data="qr.data" @close="qr.show=false" />

    <!-- Header -->
    <header class="flex items-center justify-between px-6 py-4 bg-gray-800 shadow-lg">
      <RouterLink to="/client/login" class="text-lg font-semibold text-yellow-400 hover:text-yellow-300 transition">
        <img src="@/assets/login.svg" class="w-8 inline-block mr-2">
      </RouterLink>
      <h1 class="text-xl font-bold text-yellow-400">Loyalty Program</h1>
      <button @click="openQR" class="px-4 py-2 text-lg font-semibold bg-yellow-500 hover:bg-yellow-600 rounded-lg shadow-md transition">QR</button>
    </header>

    <!-- Companies -->
    <section class="p-6">
      <div class="flex justify-between">
        <h2 class="text-xl font-semibold text-yellow-400 mb-4">Компании</h2>
        <RouterLink to="/companies" class="text-lg font-semibold text-yellow-400 hover:text-yellow-300 transition">
          Все компании>
        </RouterLink>
      </div>
      <div class="flex gap-4 overflow-x-auto scrollbar-none">
        <img v-for="company in data" :key="company.company_id" class="rounded-lg shadow-md w-35 h-45 object-cover transform transition hover:scale-105 cursor-pointer" :src="company.image_url" :alt="company.name" @click="$router.push('/campaigns/loyals/' + company.company_id)" />
      </div>
    </section>

    <!-- Categories & Sorting -->
    <section class="relative p-6 border-t border-gray-700">
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-semibold text-yellow-400">Лояльности</h2>
        <div class="flex gap-4">
          <button @click="toggleSort" class="p-2 bg-yellow-500 rounded-lg shadow hover:bg-yellow-600">
            <img src="@/assets/sort.svg" class="w-6 h-6">
          </button>
          <button @click="toggleFilter" class="p-2 bg-yellow-500 rounded-lg shadow hover:bg-yellow-600">
            <img src="@/assets/settings.svg" class="w-6 h-6">
          </button>
        </div>
      </div>

      <!-- Search Input -->
      <input v-model="searchQuery" @input="searchLoyals" type="text" placeholder="Поиск лояльности..." class="w-full p-2 mt-4 mb-4 bg-gray-700 text-white rounded-lg">

      <!-- Filters & Sorting Popups -->
      <div v-if="filter.show" class="z-30 absolute flex gap-2 right-4 top-18 p-4 pt-8 bg-gray-800 shadow-lg rounded-lg">
        <h3 class="absolute top-2 text-lg font-semibold text-yellow-400">Фильтры</h3>
        <div>
          <p class="text-center">Категории</p>
          <select @change="filterLoyals" v-model="filter.categories" multiple class="w-full bg-yellow-500 text-black p-2 rounded-md">
            <option value="Еда">Еда</option>
            <option value="Одежда">Одежда</option>
            <option value="Электроника">Электроника</option>
            <option value="Развлечения">Развлечения</option>
          </select>
        </div>
        <div>
          <p class="text-center">Типы</p>
          <select @change="filterLoyals" v-model="filter.types" multiple class="w-full bg-yellow-500 text-black p-2 rounded-md">
            <option value="accumulative">Накопительная</option>
            <option value="permanent">Постоянная</option>
          </select>
        </div>
        <button @click="resetFilters" class="p-2 mt-2 bg-red-300 text-white w-10 h-10 rounded-lg shadow hover:bg-red-600">❌</button>
      </div>
      <div v-if="sort.show" class="z-30 absolute flex gap-2 right-4 top-18 p-4 bg-gray-800 shadow-lg rounded-lg">
        <div class="grid gap-2">
          <p class="text-center">Сортировка по:</p>
          <select @change="sortLoyals" v-model="sort.mode" class="text-black p-2 text-center bg-yellow-500 rounded-lg">
            <option value="completed">Выполнению</option>
            <option value="ended">Дате окончания</option>
          </select>
        </div>
        <button @click="toggleSortInvert" class="px-2 mx-auto my-auto">
          <img class="bg-yellow-400 rounded-lg p-1 w-10" :class="[sort.invert ? 'rotate-180' : '']" src="@/assets/arrow.svg">
        </button>
      </div>
    </section>

    <!-- Loyalty Programs -->
    <section class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-6">
      <div v-for="loyal in loyals_show" :key="loyal.loyal_id" class="bg-gray-800 rounded-lg shadow-lg overflow-hidden transform transition hover:scale-105" @click="$router.push('/loyalty/detailed/'+loyal.loyal_id)">
        <div class="p-4 text-lg font-semibold text-center border-b border-gray-700">{{ loyal.name }}</div>
        <img class="w-full h-auto object-cover" :src="loyal.banner" alt="Loyalty Image">
      </div>
    </section>

    <!-- Footer -->
    <footer class="mt-auto p-6 bg-gray-800 text-center text-yellow-400 text-lg font-bold">
      <p>Хочешь крутую лояльность? <RouterLink to="/compains/auth" class="underline">Давай к нам!</RouterLink></p>
    </footer>
  </div>
</template>

<script setup>
import { RouterLink, useRouter } from 'vue-router';
import { ref, onBeforeMount, nextTick } from "vue";
import modalQR from "@/components/modalQR.vue";

const router = useRouter();
const qr = ref({ show: false, data: '' });
const sort = ref({ show: false, mode: 'completed', invert: false });
const filter = ref({ show: false, categories: [], types: [] });
const data = ref([]);
const loyals = ref([]);
const loyals_show = ref([]);
const loyals_show_filter = ref([]);
const searchQuery = ref('');


function openQR() {
  let token = localStorage.getItem("client-token");
  if (token) {
    qr.value.data = `individual/${token}`;
    qr.value.show = true;
  } else {
    router.push('/client/login');
  }
}

function toggleFilter() {
  filter.value.show = !filter.value.show;
  sort.value.show = false;
}

function toggleSort() {
  sort.value.show = !sort.value.show;
  filter.value.show = false;
}

function toggleSortInvert() {
  sort.value.invert = !sort.value.invert;
}

function filterLoyals() {
  // Start with the search-filtered list
  let filteredLoyals = [...loyals_show.value];
  let loyals_show_filter = loyals.value.filter(loyal =>
      loyal.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
  // Apply category filter if categories are selected
  if (filter.value.categories.length > 0) {
    filteredLoyals = loyals_show_filter.filter(loyal =>
        filter.value.categories.some(category => loyal.categories.includes(category))
    );
  }

  // Apply type filter if types are selected
  if (filter.value.types.length > 0) {
    filteredLoyals = loyals_show_filter.filter(loyal =>
        filter.value.types.includes(loyal.type.toLowerCase())
    );
  }

  // Update the displayed list
  loyals_show.value = filteredLoyals;
}

function resetFilters() {
  filter.value.categories = [];
  filter.value.types = [];
  searchLoyals(); // Re-apply search and filtering
}

function sortLoyals() {
  if (sort.value.mode === "ended") {
    loyals_show.value.sort((a, b) => new Date(b.end_date) - new Date(a.end_date));
  }
  if (sort.value.invert) {
    loyals_show.value.reverse();
  }
}

function searchLoyals() {
  if (searchQuery.value === '') {
    // If the search query is empty, reset to all loyalties
    loyals_show.value = [...loyals.value];
  } else {
    // Filter loyalties based on the search query
    loyals_show.value = loyals.value.filter(loyal =>
        loyal.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
    loyals_show_filter.value = loyals.value.filter(loyal =>
        loyal.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }

  // Apply filters after search
  filterLoyals();

  // Apply sorting after filtering and searching
  sortLoyals();
}

onBeforeMount(async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/company/companies`);
    if (!response.ok) throw new Error("Ошибка при загрузке данных");
    data.value = await response.json();
  } catch (error) {
    console.error("Ошибка загрузки компаний:", error);
  }

  try {
    const loyaltyResponse = await fetch(`${import.meta.env.VITE_BASE_URL}/loyal/loyalties`);
    if (!loyaltyResponse.ok) throw new Error("Ошибка при загрузке лояльностей");
    loyals.value = await loyaltyResponse.json();
    loyals_show.value = [...loyals.value];
  } catch (error) {
    console.error("Ошибка загрузки лояльностей:", error);
  }
});
</script>


<style scoped>
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
</style>
