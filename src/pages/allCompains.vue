<template>
  <RouterLink
      class="px-4 py-2 rounded-xl w-fit block absolute top-4 left-4 text-yellow-300 bg-gray-800 hover:bg-gray-700 transition"
      to="/"
  >
    ← На главную
  </RouterLink>
  <section class="p-6">
    <h2 class="text-xl font-semibold text-yellow-400 mb-4">Компании</h2>
    <div class="flex flex-col lg:grid lg:grid-cols-3 items-center gap-4 overflow-y-auto scrollbar-none">
      <div
          v-for="company in companies"
          :key="company.company_id"
          class="bg-gray-800 rounded-lg shadow-lg overflow-hidden transform transition my-4 mx-auto hover:scale-105 w-fit"
          @click="$router.push('/campaigns/loyals/' + company.company_id)"
      >
        <p class="text-center p-4 text-white text-3xl mt-2">{{ company.name }}</p>
        <img :src="company.image_url" :alt="company.name" class=" w-110 h-auto rounded-lg" />

      </div>
    </div>
    <div v-if="loading" class="text-center mt-4">Загрузка...</div>
    <div v-if="error" class="text-center mt-4 text-red-500">{{ error }}</div>
  </section>
</template>

<script>
export default {
  data() {
    return {
      companies: [], // Для хранения списка компаний
      loading: true,  // Флаг загрузки
      error: null     // Для хранения ошибки, если она возникнет
    };
  },
  mounted() {
    this.fetchCompanies();
  },
  methods: {
    async fetchCompanies() {
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/company/companies`);
        if (!response.ok) throw new Error("Ошибка при загрузке данных");
        this.companies = await response.json();
        this.loading = false;
      } catch (error) {
        console.error("Ошибка загрузки компаний:", error);
        this.error = "Не удалось загрузить компании. Пожалуйста, попробуйте позже.";
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
/* Можно добавить кастомные стили */
</style>
