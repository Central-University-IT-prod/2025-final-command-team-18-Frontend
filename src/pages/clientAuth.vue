<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-900 text-yellow-300 p-4">
    <RouterLink
        class="px-4 py-2 rounded-xl w-fit block absolute top-4 left-4 text-yellow-300 bg-gray-800 hover:bg-gray-700 transition"
        to="/"
    >
      ← На главную
    </RouterLink>
    <div v-if="!authed" class="w-full max-w-md bg-gray-800 p-6 rounded-2xl border border-gray-600 shadow-xl">
      <div v-if="auth==='login'">
        <h2 class="text-2xl font-semibold text-center mb-4">Авторизация</h2>
        <form class="grid gap-4" @submit.prevent="login">
          <input placeholder="Почта" v-model="loginParams.email" class="input-field" />
          <input placeholder="Пароль" type="password" v-model="loginParams.password" class="input-field" />
          <button type="submit" class="btn-primary">Войти</button>
        </form>
        <pre class="text-center p-2">{{ loginResult }}</pre>
        <p class="mt-6 text-center">
          Нет аккаунта?
          <button @click="auth='reg'" class="text-yellow-400 underline hover:text-yellow-500 transition">Зарегистрироваться</button>
        </p>
      </div>

      <div v-else>
        <h2 class="text-2xl font-semibold text-center mb-4">Регистрация</h2>
        <form class="grid gap-2" @submit.prevent="reg">
          <label>
            <input placeholder="Имя" v-model="regParams.name"
                   class="bg-gray-700 text-lg text-white p-2 rounded-md border border-yellow-400 w-full">
            <div class="flex flex-col">
                <small class="text-gray-400">Пример: Иван</small>
                <span class="text-red-500 text-xs">{{ errors.name }}</span>
            </div>
          </label>
          <label>
            <input placeholder="Фамилия" v-model="regParams.surname"
                   class="bg-gray-700 text-lg text-white p-2 rounded-md border border-yellow-400 w-full">
            <div class="flex flex-col">
            <small class="text-gray-400">Пример: Иванов</small>
            <span class="text-red-500 text-xs">{{ errors.surname }}</span>
            </div>
          </label>
          <label>
            <input placeholder="Телефон" v-model="regParams.phone" type="tel"
                   class="bg-gray-700 text-lg text-white p-2 rounded-md border border-yellow-400 w-full">
            <div class="flex flex-col">
            <small class="text-gray-400">Формат: +79XXXXXXXXX</small>
            <span class="text-red-500 text-xs">{{ errors.phone }}</span>
            </div>
          </label>
          <label>
            <input placeholder="Почта" v-model="regParams.email" type="email"
                   class="bg-gray-700 text-lg text-white p-2 rounded-md border border-yellow-400 w-full">
            <div class="flex flex-col">
            <small class="text-gray-400">Пример: example@mail.ru</small>
            <span class="text-red-500 text-xs">{{ errors.email }}</span>
            </div>
          </label>
          <label>
            <input placeholder="Пароль" type="password" v-model="regParams.password"
                   class="bg-gray-700 text-lg text-white p-2 rounded-md border border-yellow-400 w-full">
            <div class="flex flex-col">
            <small class="text-gray-400  text-xs mt-1">Минимум 8 символов, заглавные и прописные латинские буквы, цифры, специальные символы</small>
            <span class="text-red-500 mb-6 text-xs">{{ errors.password }}</span>
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

    <div v-else>
      <p class="text-2xl text-yellow-300">Вы уже авторизованы</p>
    </div>
  </div>
</template>

<script>
import { RouterLink } from 'vue-router';

export default {
  data() {
    return {
      authed: false,
      loginResult: '',
      regResult: '',
      auth: 'login',
      loginParams: {
        email: '',
        password: ''
      },
      regParams: {
        name: '',
        surname: '',
        phone: '',
        email: '',
        password: ''
      },
      errors: {
        name: '',
        surname: '',
        phone: '',
        email: '',
        password: ''
      }
    }
  },
  beforeMount() {
    let token = localStorage.getItem('client-token');
    if (token !== null){
      this.authed = true;
    }
  },
  methods: {
    async login() {
      const url = `${import.meta.env.VITE_BASE_URL}/clients/login`;
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
          switch (response.status) {
            case 400:
              this.loginResult = 'Неправильные параметры регистрации\n'+response.text;
              break;
            case 401:
              this.loginResult = 'Неверный логин или пароль';
              break;
            default:
              throw new Error(`Response status: ${response.status}`);
              break;
          }
        } else{
          const json = await response.json();
          localStorage.setItem("client-token", json['jwt']);
          this.loginParams = {
            email: '',
            password: ''
          }
          this.$router.push('/')
        }
      } catch (error) {
        console.error(error.message);
      }
    },
    async reg() {
      this.errors = {
        name: '',
        surname: '',
        phone: '',
        email: '',
        password: ''
      };

      let isValid = true;

      if (!this.regParams.name) {
        this.errors.name = 'Имя обязательно';
        isValid = false;
      }

      if (!this.regParams.surname) {
        this.errors.surname = 'Фамилия обязательна';
        isValid = false;
      }

      if (!this.regParams.phone || !/^\+79\d{9}$/.test(this.regParams.phone)) {
        this.errors.phone = 'Неверный формат телефона';
        isValid = false;
      }

      if (!this.regParams.email || !/\S+@\S+\.\S+/.test(this.regParams.email) || this.regParams.email.length < 8) {
        this.errors.email = 'Неверный формат почты или длина меньше 8 символов';
        isValid = false;
      }

      if (!this.regParams.password || !/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}/.test(this.regParams.password)) {
        this.errors.password = 'Пароль должен содержать минимум 8 символов, заглавные и прописные латинские буквы, цифры, специальные символы';
        isValid = false;
      }

      if (!isValid) {
        return;
      }

      const url = `${import.meta.env.VITE_BASE_URL}/clients/register`;
      try {
        const response = await fetch(
            url, {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify(this.regParams)
            }
        );
        if (!response.ok) {
          switch (response.status) {
            case 400:
              this.regResult = 'Неправильные параметры регистрации\n'+response.text;
              break;
            case 409:
              this.regResult = 'Пользователь с такой почтой уже существует';
              break;
            default:
              let text = await response.text();
              this.regResult = 'Ошибка создания аккаунта\n'+text;
              break;
          }
        } else{
          this.auth = 'login';
          this.loginResult = 'Вы успешно зарегестрированы\n Пожалуйста, авторизуйтесь'
        }

        this.regParams = {
          name: '',
          surname: '',
          phone: '',
          email: '',
          password: ''
        }
      } catch (error) {
        console.error(error.message);
      }
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
