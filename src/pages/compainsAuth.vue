<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-900 text-yellow-300 p-4">
    <RouterLink
        class="px-4 py-2 rounded-xl w-fit block absolute top-4 left-4 text-yellow-300 bg-gray-800 hover:bg-gray-700 transition"
        to="/"
    >
      ← На главную
    </RouterLink>
    <div v-if="auth==='login'" class="w-full max-w-md bg-gray-800 p-6 rounded-2xl border border-gray-600 shadow-xl">
      <h2 class="text-2xl font-semibold text-center mb-4">Авторизация</h2>
      <form class="grid gap-4" @submit.prevent="login">
        <label>
          <input placeholder="Почта" v-model="loginParams.email" type="text" class="input-field">
          <div class="flex flex-col">
          <small class="text-gray-400"></small>
          </div>
        </label>
        <label>
          <input placeholder="Пароль" v-model="loginParams.password" type="password" class="input-field">
          <div class="flex flex-col">
          <small class="text-gray-400"></small>
          </div>
        </label>
        <button type="submit" class="btn-primary">Войти</button>
      </form>
      <pre class="text-center p-2">{{ loginResult }}</pre>
      <p class="mt-6 text-center">
        Нет аккаунта?
        <button @click="auth='reg'" class="text-yellow-400 underline hover:text-yellow-500 transition">Зарегистрироваться</button>
      </p>
    </div>
    <div v-else class="w-full max-w-md bg-gray-800 p-6 rounded-2xl border border-gray-600 shadow-xl">
      <h2 class="text-2xl font-semibold text-center mb-4">Регистрация</h2>
      <form class="grid gap-2" @submit.prevent="reg">
        <label>
          <input placeholder="Введите имя" v-model="regParams.name" type="text"
                 class="bg-gray-700 text-lg text-white p-2 rounded-md border border-yellow-400 w-full">
          <div class="flex flex-col">
          <small class="text-gray-400">Пример: ООО "ПродуктМясМолКомТорг"</small>
          <span class="text-red-500 text-xs">{{ errors.name }}</span>
          </div>
        </label>
        <label>
          <input placeholder="Введите телефон" v-model="regParams.phone" type="tel"
                 class="bg-gray-700 text-lg text-white p-2 rounded-md border border-yellow-400 w-full">
          <div class="flex flex-col">
          <small class="text-gray-400">+79XXXXXXXXX</small>
          <span class="text-red-500 text-xs">{{ errors.phone }}</span>
          </div>
        </label>
        <label>
          <input placeholder="Введите почту" v-model="regParams.email" type="email"
                 class="bg-gray-700 text-lg text-white p-2 rounded-md border border-yellow-400 w-full">
          <div class="flex flex-col">
          <small class="text-gray-400">Пример: example@mail.ru</small>
          <span class="text-red-500 text-xs">{{ errors.email }}</span>
          </div>
        </label>
        <div class="p-3 rounded-md border border-yellow-400 bg-gray-700">
          <label class="text-white block mb-2" for="verBanner">Вертикальный баннер (140x180)</label>
          <div class="flex flex-col">
          <input
              id="verBanner"
              type="file"
              class="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-yellow-400 file:text-black hover:file:bg-yellow-500 transition"
              @change="attachVerBanner"
              accept="image/jpeg, image/png"
          >
          <span class="text-red-500 text-xs">{{ errors.vertical_banner }}</span>
          </div>
        </div>
        <label>
          <input placeholder="Введите пароль" v-model="regParams.password" type="password"
                 class="bg-gray-700 text-lg text-white p-2 rounded-md border border-yellow-400 w-full">
          <div class="flex flex-col">
          <small class="text-gray-400">Минимум 8 символов, заглавные и прописные латинские буквы, цифры, специальные символы</small>
          <span class="text-red-500 text-xs">{{ errors.password }}</span>
          </div>
        </label>
        <button type="submit" class="btn-primary">Создать</button>
      </form>
      <pre class="text-center p-2">{{ regResult }}</pre>
      <p class="mt-6 text-center">
        Есть аккаунт?
        <button @click="auth='login'" class="text-yellow-400 underline hover:text-yellow-500 transition">Войти в аккаунт</button>
      </p>
    </div>
  </div>
</template>

<script>
import { RouterLink } from 'vue-router';

export default {
  data() {
    return {
      regResult: '',
      loginResult: '',
      auth: 'reg',
      loginParams: {
        email: '',
        password: ''
      },
      regParams: {
        name: '',
        phone: '',
        email: '',
        vertical_banner: '',
        password: ''
      },
      errors: {
        name: '',
        phone: '',
        email: '',
        password: '',
        vertical_banner: ''
      }
    }
  },
  beforeMount() {
    let token = localStorage.getItem('business-token');
    if (token !== null && token !== 'undefined'){
      this.$router.push('/business');
    }
  },
  methods: {
    attachVerBanner(event) {
      const file = event.target.files[0];
      if (file) {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
          if (img.width === 140 && img.height === 180) {
            this.imageToBase(file);
            this.errors.vertical_banner = '';
          } else {
            this.errors.vertical_banner = 'Размеры баннера должны быть 140x180 пикселей';
            this.regParams.vertical_banner = '';
          }
        };
      }
    },
    async login() {
      const url = `${import.meta.env.VITE_BASE_URL}/company/login`;
      try {
        const response = await fetch(
            url, {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify(this.loginParams)
            }
        );

        if (!response.ok) {
          const text = await response.text();
          switch (response.status) {
            case 400:
              this.loginResult = 'Неправильные параметры регистрации\n' + text;
              break;
            case 401:
              this.loginResult = 'Неверный логин или пароль';
              break;
            default:
              this.loginResult = 'Ошибка создания аккаунта\n' + text;
              break;
          }
        } else {
          const json = await response.json();
          localStorage.setItem("business-token", json['jwt']);
          this.loginParams = {
            email: '',
            password: ''
          }
          this.$router.push('/business')
        }
      } catch (error) {
        console.error(error.message);
      }
    },

    async reg() {
      this.errors = {
        name: '',
        phone: '',
        email: '',
        password: '',
        vertical_banner: ''
      };

      let isValid = true;

      if (!this.regParams.name) {
        this.errors.name = 'Имя обязательно';
        isValid = false;
      }

      if (!this.regParams.phone || !/^\+79\d{9}$/.test(this.regParams.phone)) {
        this.errors.phone = 'Неверный формат телефона';
        isValid = false;
      }

      const emailParts = this.regParams.email.split('@');
      if (
          !this.regParams.email ||
          !/\S+@\S+\.\S+/.test(this.regParams.email) ||
          this.regParams.email.length < 8 ||
          (emailParts.length === 2 && emailParts[1] !== emailParts[1].toLowerCase())
      ) {
        this.errors.email = 'Неверный формат почты, длина меньше 8 символов или домен содержит заглавные буквы';
        isValid = false;
      }

      if (!this.regParams.vertical_banner) {
        this.errors.vertical_banner = 'Баннер обязателен';
        isValid = false;
      }

      if (!this.regParams.password || !/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}/.test(this.regParams.password)) {
        this.errors.password = 'Пароль должен содержать минимум 8 символов, заглавные и прописные латинские буквы, цифры, специальные символы';
        isValid = false;
      }

      if (!isValid) {
        return;
      }

      const url = `${import.meta.env.VITE_BASE_URL}/company/register`;
      try {
        const response = await fetch(
            url, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(this.regParams)
            }
        );

        if (!response.ok) {
          const text = await response.text();
          switch (response.status) {
            case 400:
              this.regResult = 'Неправильные параметры регистрации: ' + text;
              break;
            case 409:
              this.regResult = 'Пользователь с такой почтой уже существует';
              break;
            default:
              this.regResult = `Ошибка: ${response.status} ${text}`;
          }
        } else {
          this.loginResult = 'Вы успешно зарегестрированы\n Пожалуйста, авторизуйтесь';
          const json = await response.json();
          console.log(json);
          this.auth = 'login'
          this.regParams = {
            name: '',
            phone: '',
            email: '',
            vertical_banner: '',
            password: ''
          }
        }
      } catch (error) {
        console.error(error.message);
      }
    },

    imageToBase(img) {
      let rawImg;
      const reader = new FileReader();

      reader.onloadend = () => {
        rawImg = reader.result;
        this.regParams.vertical_banner = rawImg;
      }
      reader.readAsDataURL(img);
    }
  }
}
</script>

<style scoped>
@import "tailwindcss";

.input-field {
  @apply w-full p-3 rounded-lg bg-gray-700 text-white border border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400;
}

.btn-primary {
  @apply w-full p-3 rounded-lg bg-yellow-400 text-black font-semibold hover:bg-yellow-500 transition;
}
</style>
