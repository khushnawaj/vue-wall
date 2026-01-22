<script setup>
import { ref } from "vue";

const isDark = ref(false);

function toggleTheme() {
  isDark.value = !isDark.value;
  const root = document.documentElement;
  if (isDark.value) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}
</script>

<template>
  <header
    class="sticky top-0 z-50 backdrop-blur-md
           bg-white/70 dark:bg-black/60
           border-b border-black/5 dark:border-white/10
           transition-colors duration-300"
  >
    <div
      class="max-w-[1400px] mx-auto
             flex items-center justify-between
             px-4 sm:px-6 lg:px-10 py-3"
    >
      <!-- Brand -->
      <div class="flex flex-col leading-tight">
        <h1
          class="text-lg sm:text-xl font-semibold
                 tracking-tight"
        >
          yQuete
        </h1>
        <span
          class="text-[11px] sm:text-xs
                 text-gray-500 dark:text-gray-400"
        >
          visual journal
        </span>
      </div>

      <!-- Right actions -->
      <div class="flex items-center gap-3">
        <!-- Theme toggle -->
        <button
          @click="toggleTheme"
          class="w-9 h-9 flex items-center justify-center
                 rounded-full
                 bg-black/5 dark:bg-white/10
                 hover:bg-black/10 dark:hover:bg-white/20
                 transition"
          aria-label="Toggle theme"
        >
          <span v-if="isDark">🌙</span>
          <span v-else>☀️</span>
        </button>
      </div>
    </div>
  </header>
</template>
