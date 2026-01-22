<script setup>
import { useRoute, useRouter } from "vue-router";
import { 
  Home, 
  Search, 
  PlusSquare, 
  User 
} from "lucide-vue-next";

const route = useRoute();
const router = useRouter();

const emit = defineEmits(["openUpload"]);
</script>

<template>
  <!-- Mobile Bottom Navigation -->
  <nav
    class="
      fixed bottom-0 inset-x-0 z-50
      md:hidden
      bg-bg border-t border-border
      pb-safe
    "
  >
    <div class="flex items-center justify-around h-12">
      <!-- Home -->
      <button
        @click="router.push('/')"
        class="flex-1 flex justify-center items-center py-2 text-text transition"
      >
        <Home 
          :size="24" 
          :stroke-width="route.path === '/' ? 2.5 : 2" 
          :fill="route.path === '/' ? 'currentColor' : 'none'"
        />
      </button>

      <!-- Search -->
      <button
        @click="router.push('/search')"
        class="flex-1 flex justify-center items-center py-2 text-text transition"
      >
        <Search 
          :size="24" 
          :stroke-width="route.path === '/search' ? 3 : 2"
        />
      </button>

      <!-- Add (Primary Action) -->
      <button
        @click="$emit('openUpload')"
        class="flex-1 flex justify-center items-center py-2 text-text transition"
      >
        <PlusSquare :size="24" :stroke-width="2" />
      </button>

      <!-- Profile -->
      <button
        @click="router.push('/profile')"
        class="flex-1 flex justify-center items-center py-2 text-text transition"
      >
        <User 
          :size="24" 
          :stroke-width="route.path === '/profile' ? 2.5 : 2"
          :fill="route.path === '/profile' ? 'currentColor' : 'none'"
        />
      </button>
    </div>
  </nav>
</template>

<style scoped>
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
