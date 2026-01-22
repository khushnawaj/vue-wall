<template>
  <Transition name="heart">
    <div v-if="show" class="absolute inset-0 flex items-center justify-center pointer-events-none z-[50]">
        <Palette :size="100" class="text-white fill-white drop-shadow-2xl" />
    </div>
  </Transition>
</template>

<script setup>
import { Palette } from "lucide-vue-next";
defineProps({ show: Boolean });
</script>

<style scoped>
.heart-enter-active { animation: heart-pop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.heart-leave-active { transition: opacity 0.3s ease; }
.heart-enter-from, .heart-leave-to { opacity: 0; transform: scale(0.3); }

@keyframes heart-pop {
    0% { transform: scale(0); opacity: 0; }
    50% { transform: scale(1.3); opacity: 1; }
    100% { transform: scale(1); opacity: 0; }
}
</style>
