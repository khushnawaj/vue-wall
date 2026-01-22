<template>
  <div class="w-full max-w-2xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-3xl font-heading font-extrabold tracking-tighter text-text">Notifications</h1>
      <button 
        v-if="notificationStore.unreadCount > 0"
        @click="notificationStore.markAllAsRead"
        class="text-xs font-bold text-accent hover:underline"
      >
        Mark all as read
      </button>
    </div>

    <div v-if="notificationStore.loading" class="flex flex-col items-center py-20 gap-4">
        <div class="loader"></div>
        <p class="text-text-muted font-medium">Loading activity...</p>
    </div>

    <div v-else-if="notificationStore.notifications.length === 0" class="flex flex-col items-center py-32 text-center">
        <div class="w-16 h-16 rounded-full bg-bg-muted flex items-center justify-center text-text-muted mb-4 opacity-50">
            <Bell :size="32" />
        </div>
        <h3 class="text-xl font-heading font-bold text-text mb-2">No activity yet</h3>
        <p class="text-text-soft text-sm">When people like your art or follow you, you'll see them here.</p>
    </div>

    <div v-else class="space-y-1">
      <div 
        v-for="n in notificationStore.notifications" 
        :key="n._id"
        class="flex items-center gap-4 p-4 rounded-2xl transition hover:bg-bg-muted/50 group border border-transparent"
        :class="{ 'bg-accent/5 border-accent/10': !n.isRead }"
      >
        <!-- Avatar -->
        <div class="w-11 h-11 rounded-full overflow-hidden shrink-0 border border-border bg-bg">
          <img v-if="n.sender.avatar" :src="n.sender.avatar" class="w-full h-full object-cover">
          <div v-else class="w-full h-full flex items-center justify-center font-bold text-sm text-accent">
            {{ n.sender.name.charAt(0) }}
          </div>
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <p class="text-[14px] text-text-soft leading-tight">
            <span class="font-bold text-text hover:underline cursor-pointer" @click="$router.push(`/profile/${n.sender._id}`)">
                {{ n.sender.name }}
            </span>
            <span v-if="n.type === 'like'"> liked your artwork</span>
            <span v-else-if="n.type === 'comment'"> commented: "{{ n.text }}"</span>
            <span v-else-if="n.type === 'follow'"> started following you</span>
            <span v-else-if="n.type === 'mention'"> mentioned you in a post</span>
          </p>
          <span class="text-[11px] font-medium text-text-muted uppercase tracking-wider mt-1 block">
              {{ formatTime(n.createdAt) }}
          </span>
        </div>

        <!-- Artwork Preview -->
        <div v-if="n.artwork" class="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-border cursor-pointer hover:scale-105 transition active:scale-95" @click="openArt(n.artwork)">
          <img :src="n.artwork.imageUrl" class="w-full h-full object-cover">
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useNotificationStore } from "@/store/notificationStore";
import { useArtStore } from "@/store/artStore";
import { Bell } from "lucide-vue-next";

const notificationStore = useNotificationStore();
const artStore = useArtStore();

onMounted(() => {
  notificationStore.fetchNotifications();
  // Mark as read after a short delay
  setTimeout(() => {
      notificationStore.markAllAsRead();
  }, 2000);
});

function formatTime(date) {
  return "just now"; // Simplified for now, can use timeago
}

function openArt(artwork) {
    artStore.openPost(artwork);
}
</script>

<style scoped>
.loader {
  width: 24px;
  height: 24px;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
