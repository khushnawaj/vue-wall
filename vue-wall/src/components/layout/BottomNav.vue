<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useChatStore } from "@/store/chatStore";
import { useAuthStore } from "@/store/authStore";
import { 
  Home, 
  Search, 
  PlusSquare, 
  User,
  MessageSquare
} from "lucide-vue-next";

const route = useRoute();
const router = useRouter();
const chatStore = useChatStore();
const authStore = useAuthStore();

const unreadCount = computed(() => {
    return chatStore.messages.filter(m => !m.isRead && m.sender !== authStore.user?._id).length;
});

const emit = defineEmits(["openUpload", "openSearch"]);
</script>

<template>
  <!-- Mobile Bottom Navigation -->
  <nav
    class="
      fixed bottom-0 inset-x-0 z-[100]
      md:hidden
      bg-bg/95 backdrop-blur-md border-t border-border
      pb-safe shadow-lg
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
        @click="$emit('openSearch')"
        class="flex-1 flex justify-center items-center py-2 text-text transition"
      >
        <Search 
          :size="24" 
          :stroke-width="2"
        />
      </button>

      <!-- Add (Primary Action) -->
      <button
        @click="$emit('openUpload')"
        class="flex-1 flex justify-center items-center py-2 text-text transition"
      >
        <PlusSquare :size="24" :stroke-width="2" />
      </button>

      <!-- Chat -->
      <button
        @click="router.push('/chat')"
        class="flex-1 flex justify-center items-center py-2 text-text transition relative"
      >
        <MessageSquare 
          :size="24" 
          :stroke-width="route.path === '/chat' ? 2.5 : 2"
          :fill="route.path === '/chat' ? 'currentColor' : 'none'"
        />
        <span 
          v-if="unreadCount > 0" 
          class="absolute top-2 right-3 w-3 h-3 bg-accent text-[8px] flex items-center justify-center text-bg rounded-full font-bold border border-bg"
        >
        </span>
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
