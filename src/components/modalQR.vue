<template>
    <div class="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md p-4 z-50" @click.self="$emit('close')">
      <div class="bg-gray-800 border border-gray-600 shadow-xl rounded-2xl p-6 w-full max-w-md transform transition-all duration-300 scale-100">
        <!-- Header -->
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-yellow-400 text-center w-full">{{ title }}</h2>
          <button @click="$emit('close')" class="text-3xl text-gray-300 hover:text-white transition">&times;</button>
        </div>
        
        <!-- QR Code -->
        <div class="flex justify-center py-4">
          <canvas id="canvas" class="rounded-lg scale-65 shadow-md"></canvas>
        </div>
      </div>
    </div>
</template>

<script setup>
import { qr_to_canvas } from "@/methods/QRGenerator.js";
import { onMounted } from "vue";

let emits = defineEmits(['close']);
let props = defineProps({
    title: String,
    data: String
});

onMounted(() => {
    qr_to_canvas(document.getElementById('canvas'), props.data, 18);
});
</script>