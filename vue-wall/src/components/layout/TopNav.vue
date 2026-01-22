<template>
  <header
    class="
      sticky top-0 z-50
      w-full h-[70px]
      bg-bg-soft/90 backdrop-blur-lg border-b border-border
      flex items-center justify-between
      px-4 md:px-8 shadow-sm transition-all duration-300
    "
  >
    <!-- 1. LOGO -->
    <button
      @click="goHome"
      class="font-heading font-extrabold text-3xl md:text-2xl tracking-tight flex items-center gap-2 group"
    >
      <span class="text-text hover:text-accent transition-colors">
        ArtWall
      </span>
    </button>

    <!-- 2. CENTER NAV (Desktop) -->
    <nav class="hidden lg:flex items-center gap-1 bg-bg-muted/50 p-1.5 rounded-full border border-white/10">
        <button 
             v-for="item in menuItemsExtended" 
             :key="item.name"
             @click="handleNav(item)"
             class="p-2.5 rounded-xl transition-all duration-200 relative group"
             :class="isActive(item.path) ? 'bg-accent/10 text-accent' : 'text-text-soft hover:text-text hover:bg-bg-muted'"
             :title="item.name"
        >
            <component :is="item.icon" :size="20" :stroke-width="isActive(item.path) ? 2.5 : 2" />
        </button>
    </nav>

    <!-- 3. RIGHT ACTIONS -->
    <div class="flex items-center gap-1.5 md:gap-3">
        
        <!-- Theme Toggle -->
        <button 
            @click="emit('toggleTheme')"
            class="p-2.5 rounded-full hover:bg-bg-muted text-text-soft hover:text-text transition"
            title="Toggle Theme"
        >
            <Sun v-if="isDark" :size="18" />
            <Moon v-else :size="18" />
        </button>

        <!-- Search (Desktop) -->
        <button 
            @click="emit('openSearch')"
            class="hidden lg:flex p-2.5 rounded-full hover:bg-bg-muted text-text-soft hover:text-text transition"
            title="Search"
        >
             <Search :size="18" />
        </button>

        <template v-if="isLoggedIn">
            <!-- Messages -->
            <button 
                @click="router.push('/chat')" 
                class="hidden sm:flex p-2.5 rounded-full hover:bg-bg-muted text-text-soft hover:text-text transition relative"
                title="Messages"
            >
                <MessageSquare :size="18" />
                <span v-if="chatUnreadCount > 0" class="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-accent text-[9px] flex items-center justify-center text-bg rounded-full font-bold border-2 border-bg-soft">
                    {{ chatUnreadCount }}
                </span>
            </button>

            <!-- Notifications -->
            <button 
                @click="router.push('/notifications')" 
                class="hidden sm:flex p-2.5 rounded-full hover:bg-bg-muted text-text-soft hover:text-text transition relative"
                title="Notifications"
            >
                <Bell :size="18" />
                <span v-if="notificationStore.unreadCount > 0" class="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-accent text-[9px] flex items-center justify-center text-bg rounded-full font-bold border-2 border-bg-soft">
                    {{ notificationStore.unreadCount }}
                </span>
            </button>

             <!-- Upload Btn -->
            <button 
                @click="emit('openUpload')"
                class="hidden md:flex items-center gap-2 px-4 py-2 bg-accent text-bg rounded-full font-bold text-xs hover:opacity-90 transition shadow-lg hover:shadow-accent/20 transform hover:-translate-y-0.5 ml-1"
            >
                <Plus :size="16" />
                <span>Create</span>
            </button>

            <!-- Avatar -->
            <button 
                @click="router.push('/profile')"
                class="w-8 h-8 rounded-full p-0.5 bg-border hover:bg-accent transition-colors ml-1"
                title="Profile"
            >
                <div class="w-full h-full rounded-full overflow-hidden bg-bg">
                     <img v-if="userAvatar" :src="userAvatar" class="w-full h-full object-cover">
                     <div v-else class="w-full h-full flex items-center justify-center font-bold text-[10px] bg-bg text-text">
                        {{ userInitial }}
                     </div>
                </div>
            </button>

            <!-- Logout -->
            <button 
                @click="handleLogout"
                class="hidden md:flex p-2.5 rounded-full hover:bg-bg-muted text-text-soft hover:text-danger transition"
                title="Log Out"
            >
                <LogOut :size="18" />
            </button>
        </template>

         <template v-else>
            <button @click="router.push('/login')" class="font-bold text-xs px-4 py-2 bg-text text-bg rounded-full hover:opacity-80 transition">
                Log In
            </button>
         </template>
    </div>
  </header>

   <!-- Mobile Nav Row -->
   <nav class="lg:hidden sticky top-[70px] z-40 w-full bg-bg-soft/95 backdrop-blur-md border-b border-border flex justify-around p-1">
         <button 
             v-for="item in menuItemsExtended" 
             :key="item.name"
             @click="handleNav(item)"
             class="p-2.5 rounded-xl transition-all relative"
             :class="isActive(item.path) ? 'text-accent bg-accent/5' : 'text-text-muted'"
        >
            <component :is="item.icon" :size="20" :stroke-width="isActive(item.path) ? 2.5 : 2" />
            <span v-if="item.badge > 0" class="absolute top-2 right-2 w-3.5 h-3.5 bg-accent text-[8px] flex items-center justify-center text-bg rounded-full font-bold border border-bg-soft">
                {{ item.badge }}
            </span>
        </button>
   </nav>

</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";
import { useChatStore } from "@/store/chatStore";
import { 
  Search, 
  Moon, 
  Sun, 
  Plus,
  Home,
  Compass,
  Users, 
  LayoutGrid,
  LogOut,
  Bell,
  MessageSquare
} from "lucide-vue-next";

const emit = defineEmits(["openUpload", "toggleTheme", "openSearch"]);
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const chatStore = useChatStore();

const isLoggedIn = computed(() => !!authStore.token);
const userAvatar = computed(() => authStore.user?.avatar);
const userInitial = computed(() => authStore.user?.name?.charAt(0).toUpperCase() || "U");

// Check if dark mode is active (passed via prop or infer? better to receive prop but for now simple toggle)
// Actually App.vue passes nothing to TopNav for theme state usually, wait, SideNav had props.
// Let's assume parent controls theme.
const props = defineProps(['theme']);
const isDark = computed(() => props.theme === 'dark');

const chatUnreadCount = computed(() => {
    // Basic count of messages that are not read and not from us
    return chatStore.messages.filter(m => !m.isRead && m.sender !== authStore.user?._id).length;
});

const menuItemsExtended = computed(() => [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Search', icon: Search, action: () => emit('openSearch') },
    { name: 'Notifications', icon: Bell, path: '/notifications', badge: notificationStore.unreadCount },
    { name: 'Chat', icon: MessageSquare, path: '/chat', badge: chatUnreadCount.value },
    { name: 'Profile', icon: Users, path: '/profile' }
]);

function handleNav(item) {
    if (item.action) return item.action();
    router.push(item.path);
}

function isActive(path) {
    return route.path === path;
}

function goHome() {
  router.push("/");
}

function handleLogout() {
    if (confirm("Are you sure you want to log out?")) {
        authStore.logout();
        router.push("/login");
    }
}
</script>
