<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { RouterView } from "vue-router";

import TopNav from "@/components/layout/TopNav.vue";
import BottomNav from "@/components/layout/BottomNav.vue";
import UploadModal from "@/components/post/UploadModal.vue";
import ArtworkFocusModal from "@/components/post/ArtworkFocusModal.vue";
import SearchModal from "@/components/layout/SearchModal.vue";
import Toast from "@/components/ui/Toast.vue";

import { useArtStore } from "@/store/artStore";
import { useAuthStore } from "@/store/authStore";
import { useSocket } from "@/store/socketStore";
import { useNotificationStore } from "@/store/notificationStore";

const artStore = useArtStore();
const authStore = useAuthStore();
const socketStore = useSocket();
const notificationStore = useNotificationStore();

const showUpload = ref(false);
const showSearch = ref(false);
const theme = ref(localStorage.getItem("theme") || "light");

function applyTheme(mode) {
  document.documentElement.setAttribute("data-theme", mode);
  localStorage.setItem("theme", mode);
  theme.value = mode;
}

function toggleTheme() {
  const newTheme = theme.value === "light" ? "dark" : "light";
  applyTheme(newTheme);
}

onMounted(() => {
  applyTheme(theme.value);
  if (authStore.user) {
    socketStore.connect();
    notificationStore.fetchNotifications();
  }
});

watch(() => authStore.user, (newVal) => {
    if (newVal) {
        socketStore.connect();
        notificationStore.fetchNotifications();
    } else {
        socketStore.disconnect();
    }
});

watch(theme, (val) => applyTheme(val));

const isAnyModalOpen = computed(() => {
  return showUpload.value || !!artStore.focusedPost;
});
</script>

<template>
  <div
    id="app"
    class="
      min-h-screen flex flex-col md:flex-row
      bg-bg text-text
      transition-colors duration-500
      relative
    "
  >
    <!-- Ambient Glow Effects -->
    <div class="fixed top-0 left-[-10%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full pointer-events-none z-0"></div>
    <div class="fixed bottom-0 right-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[120px] rounded-full pointer-events-none z-0"></div>
    <!-- 2. MAIN CONTENT AREA -->
    <main class="flex-1 relative flex flex-col items-center w-full mb-16 md:mb-0">
        
        <!-- UNIFIED TOP NAV -->
        <TopNav 
            :theme="theme" 
            @toggleTheme="toggleTheme" 
            @openUpload="showUpload = true"
            @openSearch="showSearch = true"
            class="sticky top-0 z-50"
        />
        
        <!-- FLUID CONTAINER for Masonry -->
        <div class="flex-1 w-full max-w-[1600px] mx-auto pb-12 pt-4 md:pt-8 px-4 md:px-8">
             <RouterView @openUpload="showUpload = true" />
        </div>

    </main>

    <!-- Modals -->
    <ArtworkFocusModal />
    <SearchModal :isOpen="showSearch" @close="showSearch = false" />

    <transition name="fade">
      <UploadModal
        v-if="showUpload"
        @close="showUpload = false"
      />
    </transition>

    <Toast />
    
    <!-- Mobile Bottom Nav -->
    <BottomNav @openUpload="showUpload = true" @openSearch="showSearch = true" />
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
