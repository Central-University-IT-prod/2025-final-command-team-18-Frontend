<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-900 p-6">
    <div class="w-full max-w-2xl shadow-2xl bg-gray-800 border-3 border-gray-600 rounded-2xl p-8 text-yellow-300
      mt-10 lg:mt-0">
      <RouterLink
          class="px-4 py-2 rounded-xl w-fit block absolute top-4 left-4 text-yellow-300 bg-gray-800 hover:bg-gray-700 transition"
          to="/"
      >
        ← На главную
      </RouterLink>
      <h2 class="text-3xl text-center mb-6 font-bold">Создание лояльности</h2>
      <form class="grid gap-4" @submit.prevent="submitForm">
        <div>
          <input v-model="name" placeholder="Название лояльности" class="input-field" />
          <span v-if="errors.name" class="text-red-500 text-sm">{{ errors.name }}</span>
        </div>
        <div>
          <textarea v-model="description" placeholder="Полное описание" class="input-field resize-none"></textarea>
          <span v-if="errors.description" class="text-red-500 text-sm">{{ errors.description }}</span>
        </div>
        <div class="p-3 rounded-md border-2 border-yellow-300 bg-gray-800">
          <label class="text-white block mb-2" for="verBanner">Горизонтальный баннер (300x200)</label>
          <input
              id="verBanner"
              type="file"
              class="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-yellow-400 file:text-black hover:file:bg-yellow-500 transition"
              @change="handleFileUpload"
              accept="image/jpeg, image/png, image/gif"
          >
          <span v-if="errors.banner" class="text-red-500 text-sm">{{ errors.banner }}</span>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <input v-model.number="total_activations" type="number" placeholder="Общее кол-во активаций" class="input-field" />
            <span v-if="errors.total_activations" class="text-red-500 text-sm">{{ errors.total_activations }}</span>
          </div>
          <div>
            <input v-model.number="unique_activations" type="number" placeholder="Кол-во активаций на человека" class="input-field" />
            <span v-if="errors.unique_activations" class="text-red-500 text-sm">{{ errors.unique_activations }}</span>
          </div>
        </div>
        <div v-if="type === 'accumulative' || type === 'permanent'" class="grid grid-cols-2 gap-4">
          <div>
            <input v-model="start_date" type="date" class="input-field" :min="new Date().toISOString().split('T')[0]" />
            <span v-if="errors.start_date" class="text-red-500 text-sm">{{ errors.start_date }}</span>
          </div>
          <div>
            <input v-model="end_date" type="date" class="input-field" :min="new Date().toISOString().split('T')[0]" />
            <span v-if="errors.end_date" class="text-red-500 text-sm">{{ errors.end_date }}</span>
          </div>
        </div>
        <div>
          <select v-model="type" class="input-field">
            <option value="accumulative">Накопительная</option>
            <option value="permanent">Постоянная</option>
          </select>
          <span v-if="errors.type" class="text-red-500 text-sm">{{ errors.type }}</span>
        </div>
        <div v-if="type === 'accumulative'" class="grid gap-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <input v-model="accumulate_product_id" placeholder="Айди товара для выполнения" class="input-field" />
              <span v-if="errors.accumulate_product_id" class="text-red-500 text-sm">{{ errors.accumulate_product_id }}</span>
            </div>
            <div>
              <input v-model="accumulate_discount_product_id" placeholder="Айди товара для скидки" class="input-field" />
              <span v-if="errors.accumulate_discount_product_id" class="text-red-500 text-sm">{{ errors.accumulate_discount_product_id }}</span>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <input v-model.number="accumulate_n" type="number" placeholder="Кол-во товаров" class="input-field" />
              <span v-if="errors.accumulate_n" class="text-red-500 text-sm">{{ errors.accumulate_n }}</span>
            </div>
            <div>
              <input v-model.number="accumulate_discount_percent" type="number" step="0.01" max="100" placeholder="Скидка" class="input-field" />
              <span v-if="errors.accumulate_discount_percent" class="text-red-500 text-sm">{{ errors.accumulate_discount_percent }}</span>
            </div>
          </div>
        </div>
        <div v-if="type === 'permanent'" class="grid gap-4">
          <div>
            <input v-model="permanent_product_id" placeholder="Айди товара для скидки" class="input-field" />
            <span v-if="errors.permanent_product_id" class="text-red-500 text-sm">{{ errors.permanent_product_id }}</span>
          </div>
          <div>
            <input v-model.number="permanent_discount_percent" type="number" step="0.01" placeholder="Скидка на товар" class="input-field" />
            <span v-if="errors.permanent_discount_percent" class="text-red-500 text-sm">{{ errors.permanent_discount_percent }}</span>
          </div>
        </div>
        <div>
          <select v-model="categories" multiple class="input-field">
            <option value="Еда">Еда</option>
            <option value="Одежда">Одежда</option>
            <option value="Электроника">Электроника</option>
            <option value="Развлечения">Развлечения</option>
          </select>
          <span v-if="errors.categories" class="text-red-500 text-sm">{{ errors.categories }}</span>
        </div>
        <pre class="text-center p-2 break-all">{{ this.create_result }}</pre>
        <input type="submit" value="Создать" class="btn-submit" />
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { RouterLink } from 'vue-router';

export default {
  data() {
    return {
      name: '',
      description: '',
      banner: null,
      total_activations: '',
      unique_activations: '',
      type: 'accumulative',  // Начальный выбор — Накопительная
      categories: [],

      // Данные для накопительной лояльности
      accumulate_product_id: '',
      accumulate_n: null,
      accumulate_discount_product_id: '',
      accumulate_discount_percent: '',

      // Данные для постоянной лояльности
      permanent_product_id: '',
      permanent_discount_percent: '',

      // Даты начала и конца
      start_date: '',
      end_date: '',

      create_result: '',
      errors: {}
    };
  },
  methods: {
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        const img = new Image();
        img.onload = () => {
          if (img.width !== 300 || img.height !== 200) {
            this.errors.banner = 'Баннер должен быть размером 300x200 пикселей';
          } else {
            this.imageToBase(file);
            this.errors.banner = '';
          }
        };
        img.onerror = () => {
          this.errors.banner = 'Не удалось загрузить изображение';
        };
        img.src = URL.createObjectURL(file);
      }
    },
    validateForm() {
      this.errors = {};

      if (!this.name ||
          this.name.length < 5) {
        this.errors.name = 'Имя обязательно и в нем должно быть больше 5 букв';
      }

      if (!this.description ||
          this.description.length < 5) {
        this.errors.description = 'Описание обязательно и в нем должно быть больше 5 букв';
      }

      if (!this.banner) {
        this.errors.banner = 'Баннер обязателен';
      }

      if (!this.total_activations) {
        this.errors.total_activations = 'Общее кол-во активаций обязательно';
      }

      if (!this.unique_activations) {
        this.errors.unique_activations = 'Кол-во активаций на человека обязательно';
      }

      const today = new Date().toISOString().split('T')[0];
      if (!this.start_date) {
        this.errors.start_date = 'Дата начала обязательна';
      } else if (this.start_date < today) {
        this.errors.start_date = 'Дата начала не может быть раньше сегодняшнего дня';
      }

      if (!this.end_date) {
        this.errors.end_date = 'Дата окончания обязательна';
      } else if (this.end_date < this.start_date) {
        this.errors.end_date = 'Дата окончания не может быть раньше даты начала';
      }

      if (!this.categories.length) {
        this.errors.categories = 'Выберите хотя бы одну категорию';
      }

      if (this.type === 'accumulative') {
        if (!this.accumulate_product_id) {
          this.errors.accumulate_product_id = 'Айди товара для выполнения обязателен';
        }

        if (!this.accumulate_discount_product_id) {
          this.errors.accumulate_discount_product_id = 'Айди товара для скидки обязателен';
        }

        if (!this.accumulate_n) {
          this.errors.accumulate_n = 'Кол-во товаров обязательно';
        }

        if (!this.accumulate_discount_percent) {
          this.errors.accumulate_discount_percent = 'Скидка обязательна';
        }
      }

      if (this.type === 'permanent') {
        if (!this.permanent_product_id) {
          this.errors.permanent_product_id = 'Айди товара для скидки обязателен';
        }

        if (!this.permanent_discount_percent) {
          this.errors.permanent_discount_percent = 'Скидка на товар обязательна';
        }
      }

      return Object.keys(this.errors).length === 0;
    },
    async submitForm() {
      if (!this.validateForm()) {
        return;
      }

      // Преобразуем start_date и end_date в Unix timestamp
      const start_timestamp = new Date(this.start_date).getTime() / 1000;
      const end_timestamp = new Date(this.end_date).getTime() / 1000;

      // Формируем payload в зависимости от типа лояльности
      const payload = {
        name: this.name,
        description: this.description,
        banner: this.banner,
        total_activations: this.total_activations,
        unique_activations: this.unique_activations,
        type: this.type,
        categories: this.categories,
        start_date: start_timestamp,
        end_date: end_timestamp,
      };

      // В зависимости от типа лояльности добавляем дополнительные параметры
      if (this.type === 'accumulative') {
        payload.accumulate_product_id = this.accumulate_product_id;
        payload.accumulate_n = this.accumulate_n;
        payload.accumulate_discount_product_id = this.accumulate_discount_product_id;
        payload.accumulate_discount_percent = this.accumulate_discount_percent / 100;
      } else if (this.type === 'permanent') {
        payload.permanent_product_id = this.permanent_product_id;
        payload.permanent_discount_percent = this.permanent_discount_percent / 100;
      }

      const url = `${import.meta.env.VITE_BASE_URL}/loyal/create/loyalty`;

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("business-token")}`,
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          switch (response.status) {
            case 400:
              let text = decodeURIComponent(JSON.parse(await response.text())["reason"]);
              this.create_result = 'Неправильные параметры создания\n' + text;
              break;
            case 403:
              this.create_result = 'Нет доступа';
              break;
            default:
              let error = await response.text();
              this.create_result = 'Ошибка создания лояльности\n' + error;
              break;
          }
        } else {
          const json = await response.json();
          this.create_result = "Лояльность успешно создана!";

          // Очистка данных формы
          this.name = '';
          this.description = '';
          this.banner = null;
          this.total_activations = '';
          this.unique_activations = '';
          this.type = 'accumulative';
          this.categories = [];
          this.accumulate_product_id = '';
          this.accumulate_n = null;
          this.accumulate_discount_product_id = '';
          this.accumulate_discount_percent = '';
          this.permanent_product_id = '';
          this.permanent_discount_percent = '';
          this.start_date = '';
          this.end_date = '';

          this.$router.push('/business');
        }
      } catch (error) {
        console.log(payload);
        console.error(error.message);
        alert("Ошибка при создании лояльности");
      }
    },
    imageToBase(img) {
      const reader = new FileReader();
      reader.onloadend = () => {
        this.banner = reader.result;
      };
      reader.readAsDataURL(img);
    }
  },
};
</script>

<style scoped>
@import "tailwindcss";

.input-field {
  @apply w-full p-3 text-white text-center rounded-lg border-2 border-yellow-300 bg-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400;
}
.file-upload {
  @apply p-3 rounded-lg border-2 border-yellow-300;
}
.file-input {
  @apply w-full text-white p-2 rounded-lg cursor-pointer;
}
.btn-submit {
  @apply w-full p-3 text-black bg-yellow-300 rounded-lg cursor-pointer transition hover:bg-yellow-400;
}

pre {
  white-space: pre-wrap;       /* Since CSS 2.1 */
  white-space: -moz-pre-wrap;  /* Mozilla, since 1999 */
  white-space: -pre-wrap;      /* Opera 4-6 */
  white-space: -o-pre-wrap;    /* Opera 7 */
  word-wrap: break-word;       /* Internet Explorer 5.5+ */
}
</style>
