<script setup>
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { 
  Home, 
  Compass, 
  PlusCircle, 
  User, 
  Sparkles,
  Search
} from "lucide-vue-next";

const router = useRouter();
const route = useRoute();
const emit = defineEmits(["openUpload"]);

const items = computed(() => [
  { name: 'Home', icon: Home, path: '/' },
  { name: 'Discover', icon: Compass, path: '/explore' },
  { name: 'Create', icon: PlusCircle, action: true, highlight: true },
  { name: 'Search', icon: Search, path: '/search' },
  { name: 'Profile', icon: User, path: '/profile' },
]);

function handleClick(item) {
  if (item.action) {
    emit("openUpload");
  } else {
    router.push(item.path);
  }
}
</script>

<template>
  <nav class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
    <div 
        class="
            glass-panel 
            flex items-center gap-2 
            px-4 py-3 rounded-full 
            transition-all duration-300
            hover:scale-105
        "
    >
      <button
        v-for="item in items"
        :key="item.name"
        @click="handleClick(item)"
        class="
            relative group
            w-12 h-12 
            flex items-center justify-center 
            rounded-full 
            transition-all duration-300 
            ease-[cubic-bezier(0.34,1.56,0.64,1)]
            hover:-translate-y-3 hover:scale-125
        "
        :class="[
            route.path === item.path ? 'bg-white/20 shadow-inner' : 'hover:bg-white/10',
            item.highlight ? 'text-transparent bg-clip-text bg-gradient-to-tr from-pink-500 to-violet-500' : 'text-text'
        ]"
      >
        <!-- Icon -->
        <component 
            :is="item.icon" 
            :size="26" 
            :stroke-width="item.highlight ? 3 : 2"
            class="filter drop-shadow-sm" 
            :class="{ 'stroke-[url(#gradient)]': item.highlight }"
        />
        
        <!-- SVG Gradient Def for icon (optional trick, or just use colored icon) -->
        <!-- Tooltip -->
        <span 
            class="
                absolute -top-10 left-1/2 -translate-x-1/2
                px-2 py-1 rounded-md
                bg-black/80 text-white text-xs font-medium
                opacity-0 group-hover:opacity-100
                transition-opacity duration-200
                pointer-events-none whitespace-nowrap
            "
        >
            {{ item.name }}
        </span>

        <!-- Active Dot -->
        <span 
            v-if="route.path === item.path"
            class="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-current"
        ></span>
      </button>

      <!-- Theme Toggle (Mini) -->
      <div class="w-px h-6 bg-border-glass mx-2"></div>
      
      <button class="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition text-text">
         <Sparkles :size="20" />
      </button>
    </div>
  </nav>
</template>

<style scoped>
/* Spring transition for the dock items */
button {
    transform-origin: bottom center;
}
</style>
