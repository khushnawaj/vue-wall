<script setup>
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { 
  Home, 
  Compass, 
  Users, 
  Tv, 
  Store,
  LayoutGrid,
  Settings,
  Moon,
  Sun
} from "lucide-vue-next";

const router = useRouter();
const route = useRoute();

const emit = defineEmits(["toggleTheme"]);

const props = defineProps({
  theme: {
    type: String,
    default: 'light'
  }
});

const menuItems = computed(() => [
  { name: 'Home', icon: Home, path: '/', active: route.path === '/' },
  { name: 'Your Profile', icon: Users, path: '/profile', active: route.path === '/profile' },
  { name: 'Explore', icon: Compass, path: '/explore', active: route.path === '/explore' },
  { name: 'Watch', icon: Tv, path: '/watch', active: route.path === '/watch' },
  { name: 'Marketplace', icon: Store, path: '/market', active: route.path === '/market' },
  { name: 'Groups', icon: LayoutGrid, path: '/groups', active: route.path === '/groups' },
]);

function handleItemClick(item) {
  if (item.path) {
    router.push(item.path);
  }
}
</script>

<template>
  <aside class="w-full py-4 pr-2">
    <!-- Main Menu -->
    <nav class="space-y-1">
      <template v-for="item in menuItems" :key="item.name">
        <button
          @click="handleItemClick(item)"
          class="
            w-full flex items-center gap-4 
            px-4 py-3 rounded-l-none md:rounded-r-full lg:rounded-xl 
            transition-all duration-200
            group
          "
          :class="item.active ? 'bg-accent/10 text-accent' : 'text-text hover:bg-bg-muted'"
        >
          <component 
            :is="item.icon" 
            :size="24" 
            :class="item.active ? 'fill-accent text-accent' : 'text-text-soft group-hover:text-text'" 
             stroke-width="2"
          />
          <span 
            class="font-medium text-[15px]"
            :class="item.active ? 'text-accent font-semibold' : ''"
          >
            {{ item.name }}
          </span>
        </button>
      </template>
    </nav>

    <div class="my-4 border-b border-border mx-4"></div>

    <!-- Shortcuts / Settings -->
    <nav class="space-y-1">
         <button
          class="
            w-full flex items-center gap-4 
            px-4 py-3 rounded-xl 
            text-text hover:bg-bg-muted
            transition-all group
          "
        >
            <Settings :size="24" class="text-text-soft group-hover:text-text" />
            <span class="font-medium text-[15px]">Settings</span>
        </button>

         <button
          @click="$emit('toggleTheme')"
          class="
            w-full flex items-center gap-4 
            px-4 py-3 rounded-xl 
            text-text hover:bg-bg-muted
            transition-all group
          "
        >
            <Sun v-if="theme === 'dark'" :size="24" class="text-text-soft group-hover:text-text" />
            <Moon v-else :size="24" class="text-text-soft group-hover:text-text" />
            <span class="font-medium text-[15px]">
                {{ theme === 'dark' ? 'Light Mode' : 'Dark Mode' }}
            </span>
        </button>
    </nav>

    <!-- Footer -->
    <div class="mt-8 px-5 text-xs text-text-muted leading-relaxed">
        Privacy  · Terms  · Advertising  · Ad Choices   · Cookies  ·   More · ArtWall © 2024
    </div>
  </aside>
</template>
