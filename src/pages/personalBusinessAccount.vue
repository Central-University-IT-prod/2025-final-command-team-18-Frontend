<template>
  <div class="min-h-screen flex flex-col bg-gray-900 text-yellow-300">
    <!-- Навигация -->
    <nav class="flex border-3 border-gray-500 bg-gray-800 text-yellow-300 rounded-xl items-center justify-between p-4 m-4 shadow-lg">
      <RouterLink class="px-2 py-1 rounded-xl bg-yellow-400 text-black font-semibold hover:bg-yellow-500 transition" to="/">
        На главную
      </RouterLink>
      <div>
        <button @click="activeTab = 'stats'" class=" px-4 py-2 rounded-lg transition" :class="tabClass('stats')">
          📊 Статистика
        </button>
        <button @click="activeTab = 'loyalty'" class="px-4 py-2 rounded-lg transition" :class="tabClass('loyalty')">
          🎫 Лояльности
        </button>
      </div>
      <button @click="logout" class="px-2 py-1 rounded-xl bg-yellow-400 text-black  hover:bg-yellow-500 transition">Выйти из аккаунта</button>
    </nav>

    <!-- Контент -->
    <div class="mt-6 px-4">
      <div v-if="activeTab === 'stats'" class="text-center text-xl font-semibold">
        <Statistics/>
      </div>

      <div v-if="activeTab === 'loyalty'" class="grid justify-center">
        <div class="grid justify-center">
          <button @click="createLoyalty" class="bg-yellow-400 text-black font-semibold px-4 py-2 rounded-lg shadow-lg hover:bg-yellow-500 transition">
            ➕ Создать лояльность
          </button>
        </div>
        <section class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[repeat(2,_300px)] gap-6 mt-6">
          <div v-for="(loyal, index) in loyaltyImages" :key="loyal.id" class="border-2 border-gray-500 bg-gray-800 shadow-lg rounded-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl w-full max-w-[300px] mx-auto">
            <div class="p-4 text-lg font-bold text-center border-b-2 border-gray-500">
              {{ loyal.name }}
            </div>
            <img class="w-full h-auto object-cover rounded-b-2xl" :src="loyal.banner" alt="Loyalty Image">
            <div class="flex justify-between p-4">
              <button @click="openEditModal(index)" class="text-blue-400 font-semibold hover:text-blue-500 transition">✏️ Редактировать</button>
              <button @click="deleteLoyalty(index)" class="text-red-400 font-semibold hover:text-red-500 transition">🗑️ Удалить</button>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- Модалка для редактирования -->
    <div v-if="isEditModalOpen" class="fixed inset-0 flex items-center justify-center bg-black/50">
      <div class="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">Редактировать лояльность</h2>
        <form @submit.prevent="saveEditedLoyalty">
          <div class="mb-4">
            <label class="block text-yellow-300">Всего активаций</label>
            <input v-model="editedLoyalty.total_activations" type="number" class="w-full text-white px-4 py-2 rounded-lg bg-gray-700" required>
          </div>
          <div class="mb-4">
            <label class="block text-yellow-300">Активаций на человека</label>
            <input v-model="editedLoyalty.unique_activations" type="number" class="w-full text-white px-4 py-2 rounded-lg bg-gray-700" required>
          </div>
          <div class="mb-4">
            <label class="block text-yellow-300">Дата окончания</label>
            <input v-model="editedLoyalty.end_date" type="date" class="w-full text-white px-4 py-2 rounded-lg bg-gray-700" required>
          </div>
          <div class="flex justify-end">
            <button type="button" @click="closeEditModal" class="mr-2 px-4 py-2 rounded-lg bg-gray-600 text-yellow-300 hover:bg-gray-700 transition">Отмена</button>
            <button type="submit" class="px-4 py-2 rounded-lg bg-yellow-400 text-black font-semibold hover:bg-yellow-500 transition">Сохранить</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onBeforeMount, computed } from "vue";
import { useRouter } from 'vue-router';
import { jwtDecode } from "jwt-decode";
import Statistics from "../components/statistics.vue";

const activeTab = ref('loyalty');
const loyaltyImages = ref([]);
const isEditModalOpen = ref(false);
const editedLoyalty = ref({
  unique_activations: 0,
  total_activations: 0,
  end_date: '',
  index: null
});

const router = useRouter();

onBeforeMount(async () => {
  let token = localStorage.getItem('business-token');
  if (!token || token === 'undefined') {
    return router.push('/compains/auth');
  }

  let decoded;
  try {
    decoded = jwtDecode(token);
  } catch (error) {
    console.error("Invalid token", error);
  }

  try {
    const loyaltyResponse = await fetch(`${import.meta.env.VITE_BASE_URL}/loyal/loyalties?company=${decoded['user_id']}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!loyaltyResponse.ok) throw new Error("Ошибка при загрузке изображений лояльности");
    loyaltyImages.value = await loyaltyResponse.json();
  } catch (error) {
    console.error("Ошибка загрузки изображений лояльности:", error);
  }
});

const createLoyalty = () => {
  router.push('/business/maker');
};

const logout = () => {
  console.log("Logging out and clearing localStorage...");
  localStorage.clear();
  console.log("localStorage cleared.");
  // Optionally, redirect the user to a login page or perform other logout actions
  router.push('/compains/auth');
};

const openEditModal = (index) => {
  const loyalty = loyaltyImages.value[index];
  console.log("Editing loyalty:", loyalty);
  editedLoyalty.value = {
    total_activations: loyalty.total_activations,
    unique_activations: loyalty.unique_activations,
    end_date: convertUnixTimestampToInputDate(loyalty.end_date), // Сохраняем оригинальное значение Unix timestamp
    index: index
  };
  isEditModalOpen.value = true;
};

const closeEditModal = () => {
  isEditModalOpen.value = false;
};

const saveEditedLoyalty = async () => {
  const index = editedLoyalty.value.index;
  const loyaltyId = loyaltyImages.value[index].loyal_id;

  // Convert the input date back to Unicode timestamp
  const endDate = new Date(editedLoyalty.value.end_date);
  editedLoyalty.value.end_date = Math.floor(endDate.getTime() / 1000);

  try {
    console.log(editedLoyalty.value.end_date)
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/loyal/loyalty/${loyaltyId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("business-token")}`,
      },
      body: JSON.stringify(editedLoyalty.value),
    });
    if (!response.ok) throw new Error("Ошибка при редактировании лояльности");
    loyaltyImages.value[index] = { ...loyaltyImages.value[index], ...editedLoyalty.value };
    closeEditModal();
  } catch (error) {
    console.error("Ошибка редактирования лояльности:", error);
  }
};

const deleteLoyalty = async (index) => {
  try {
    const loyaltyResponse = await fetch(`${import.meta.env.VITE_BASE_URL}/loyal/loyalty/${loyaltyImages.value[index]["loyal_id"]}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("business-token")}`,
      },
    });
    if (!loyaltyResponse.ok) throw new Error("Ошибка при удалении лояльности");
    location.reload();
  } catch (error) {
    console.error("Ошибка удаления лояльности:", error);
  }
};

const tabClass = (tab) => {
  return activeTab.value === tab ? 'font-bold text-yellow-300' : 'text-gray-200';
};

function convertUnixTimestampToInputDate(unixTimestamp) {
  const date = new Date(unixTimestamp * 1000);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Месяцы в JavaScript начинаются с 0
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
</script>

<style>
button:hover {
  opacity: 0.8;
}
</style>
