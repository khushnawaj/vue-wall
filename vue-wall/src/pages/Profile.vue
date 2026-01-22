<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useArtStore } from "@/store/artStore";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { useToastStore } from "@/store/toastStore";
import { Grid, Bookmark as BookmarkIcon, User, Palette, MessageCircle } from "lucide-vue-next";
import EditProfileModal from "@/components/profile/EditProfileModal.vue";

const route = useRoute();
const router = useRouter();
const store = useArtStore();
const authStore = useAuthStore();
const chatStore = useChatStore();
const toastStore = useToastStore();

const userProfile = ref(null);
const userArtworks = ref([]);
const loadingProfile = ref(true);

const isMyProfile = computed(() => {
    return !route.params.id || route.params.id === authStore.user?._id;
});

const showEditModal = ref(false);
const currentTab = ref("posts"); // 'posts', 'saved', 'tagged'

const userInitial = computed(() => {
  const name = isMyProfile.value ? authStore.user?.name : userProfile.value?.name;
  return (name || "U").charAt(0).toUpperCase();
});

const displayedPosts = computed(() => {
    if (isMyProfile.value) {
        if (currentTab.value === 'posts') return store.myPosts;
        if (currentTab.value === 'saved') return store.savedPosts;
        if (currentTab.value === 'tagged') return store.taggedPosts;
    } else {
        if (currentTab.value === 'posts') return userArtworks.value;
        if (currentTab.value === 'tagged') return store.taggedPosts;
    }
    return [];
});

async function loadProfile() {
    loadingProfile.value = true;
    try {
        if (isMyProfile.value) {
            if (!authStore.user && authStore.token) {
                await authStore.fetchMe();
            }
            userProfile.value = authStore.user;
            await store.fetchMyArtworks();
            if (currentTab.value === 'saved') await store.fetchSavedArtworks();
            if (currentTab.value === 'tagged') await store.fetchTaggedArtworks(authStore.user?._id);
        } else {
            const id = route.params.id;
            const profile = await store.fetchUserProfile(id);
            if (profile) {
                userProfile.value = profile;
                userArtworks.value = await store.fetchUserArtworks(id) || [];
                if (currentTab.value === 'tagged') await store.fetchTaggedArtworks(id);
            } else {
                userProfile.value = null;
            }
        }
    } catch (error) {
        console.error("Profile load failed:", error);
    } finally {
        loadingProfile.value = false;
    }
}

const isFollowing = computed(() => {
    return authStore.user?.following?.includes(userProfile.value?._id);
});

async function handleFollow() {
    if (!authStore.user) {
        toastStore.info("Please login to follow artists");
        return router.push('/login');
    }
    const res = await store.toggleFollow(userProfile.value._id);
    if (res) {
        userProfile.value.followers = res.followers;
        userProfile.value.following = res.following;
    }
}

async function startDirectChat() {
    if (!authStore.user) return router.push('/login');
    await chatStore.startChat(userProfile.value._id);
    router.push('/chat');
}

watch(() => route.params.id, loadProfile);

watch(() => authStore.user, (newVal) => {
    if (isMyProfile.value && newVal) {
        userProfile.value = newVal;
    }
}, { deep: true });

watch(currentTab, (newTab) => {
    const id = isMyProfile.value ? authStore.user?._id : route.params.id;
    if (newTab === 'posts') isMyProfile.value ? store.fetchMyArtworks() : store.fetchUserArtworks(id);
    if (newTab === 'saved' && isMyProfile.value) store.fetchSavedArtworks();
    if (newTab === 'tagged') store.fetchTaggedArtworks(id);
});

onMounted(loadProfile);
</script>

<template>
  <div class="max-w-6xl mx-auto pt-12 px-5 pb-20">
    
    <!-- Loading State -->
    <div v-if="loadingProfile" class="flex flex-col items-center justify-center py-40 gap-4">
        <div class="loader"></div>
        <p class="text-xs font-bold text-text-muted uppercase tracking-widest animate-pulse">Loading Profile...</p>
    </div>

    <!-- Profile Content -->
    <div v-else-if="userProfile" class="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <!-- Profile Header -->
        <header class="flex flex-col md:flex-row items-center md:items-start gap-10 mb-20 ">
            <!-- Avatar -->
            <div class="w-32 h-32 md:w-36 md:h-36 rounded-full border border-border p-1.5 bg-bg-soft shrink-0">
                <div class="w-full h-full rounded-full overflow-hidden bg-bg-muted relative border border-border">
                    <img 
                        v-if="userProfile.avatar" 
                        :src="userProfile.avatar" 
                        class="w-full h-full object-cover"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center text-4xl font-heading font-bold text-text-muted">
                        {{ userInitial }}
                    </div>
                </div>
            </div>

            <!-- Info -->
            <div class="flex-1 flex flex-col items-center md:items-start text-center md:text-left pt-4">
                
                <!-- Top Row: Name + Actions -->
                <div class="flex flex-wrap justify-center md:justify-start items-center gap-6 mb-4">
                    <h2 class="text-3xl font-heading font-extrabold text-text tracking-tighter">{{ userProfile.name || "username" }}</h2>
                    
                    <div class="flex gap-2">
                        <button 
                            v-if="isMyProfile"
                            @click="showEditModal = true"
                            class="px-5 py-2 bg-text text-bg hover:opacity-90 transition font-bold text-xs rounded-full"
                        >
                            Edit Profile
                        </button>
                        <div v-else class="flex gap-2">
                            <button 
                                @click="handleFollow"
                                class="px-8 py-2 font-bold text-xs rounded-full transition-all"
                                :class="isFollowing ? 'bg-bg-muted text-text-soft border border-border' : 'bg-accent text-bg shadow-lg shadow-accent/20 hover:opacity-90'"
                            >
                                {{ isFollowing ? 'Following' : 'Follow' }}
                            </button>
                            <button 
                                @click="startDirectChat"
                                class="px-6 py-2 bg-text text-bg hover:opacity-90 transition font-bold text-xs rounded-full"
                            >
                                Message
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Stats Row -->
                <div class="flex justify-around w-full md:w-auto md:justify-start md:gap-8 mb-6 text-sm font-medium border-y md:border-none border-border py-4 md:py-0">
                    <div class="text-text-soft">
                    <span class="text-text font-bold">{{ isMyProfile ? store.myPosts.length : userArtworks.length }}</span> posts
                    </div>
                    <div class="text-text-soft">
                    <span class="text-text font-bold">{{ userProfile.followers?.length || 0 }}</span> followers
                    </div>
                    <div class="text-text-soft">
                    <span class="text-text font-bold">{{ userProfile.following?.length || 0 }}</span> following
                    </div>
                </div>

                <!-- Bio -->
                <div class="text-[15px] leading-relaxed max-w-lg">
                    <p class="text-text-soft whitespace-pre-wrap">{{ userProfile.bio || "Digital artist & creative explorer." }}</p>
                </div>
            </div>
        </header>

        <!-- Tabs -->
        <div class="border-t border-border flex justify-center gap-12 text-xs font-bold tracking-widest text-text-muted mb-8 uppercase">
            <div 
                @click="currentTab = 'posts'"
                class="py-4 border-t transition-all cursor-pointer flex items-center gap-2"
                :class="currentTab === 'posts' ? 'border-text text-text' : 'border-transparent hover:text-text'"
            >
                <Grid :size="12" /> Posts
            </div>
            <div 
                v-if="isMyProfile"
                @click="currentTab = 'saved'"
                class="py-4 border-t transition-all cursor-pointer flex items-center gap-2"
                :class="currentTab === 'saved' ? 'border-text text-text' : 'border-transparent hover:text-text'"
            >
                <BookmarkIcon :size="12" /> Saved
            </div>
            <div 
                @click="currentTab = 'tagged'"
                class="py-4 border-t transition-all cursor-pointer flex items-center gap-2"
                :class="currentTab === 'tagged' ? 'border-text text-text' : 'border-transparent hover:text-text'"
            >
                <User :size="12" /> Tagged
            </div>
        </div>

        <!-- Grid -->
        <div v-if="displayedPosts.length > 0" class="grid grid-cols-2 sm:grid-cols-3 gap-1 md:gap-4 lg:gap-6">
            <div 
                v-for="post in displayedPosts" 
                :key="post._id"
                class="aspect-square bg-bg-muted relative group cursor-pointer overflow-hidden rounded-md md:rounded-lg"
                @click="store.openPost(post)"
            >
                <img :src="post.imageUrl" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
                
                <!-- Hover Overlay -->
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-8 text-white font-bold transition-all duration-300">
                    <div class="flex items-center gap-2 scale-90 group-hover:scale-100 transition-transform">
                        <Palette :size="20" fill="currentColor" /> {{ post.likes?.length || 0 }}
                    </div>
                    <div class="flex items-center gap-2 scale-90 group-hover:scale-100 transition-transform">
                        <MessageCircle :size="20" fill="currentColor" /> {{ post.commentCount || 0 }}
                    </div>
                </div>
            </div>
        </div>

        <!-- Empty State -->
        <div v-else class="flex flex-col items-center justify-center py-24 text-center">
            <div class="w-16 h-16 rounded-full bg-bg-soft flex items-center justify-center mb-6 text-text-muted">
                <Grid v-if="currentTab === 'posts'" :size="32" />
                <BookmarkIcon v-else-if="currentTab === 'saved'" :size="32" />
                <User v-else :size="32" />
            </div>
            <h3 class="text-2xl font-heading font-medium text-text mb-2">No {{ currentTab }} Yet</h3>
            <p class="text-text-soft text-sm max-w-xs mx-auto">
                {{ 
                    currentTab === 'posts' ? (isMyProfile ? "Share your first masterpiece with the world." : "This user hasn't posted anything yet.") :
                    currentTab === 'saved' ? "Save artworks you love to see them here." :
                    "Artworks that mention this user will appear here."
                }}
            </p>
        </div>
    </div>

    <!-- Error State -->
    <div v-else class="flex flex-col items-center justify-center py-40 gap-4">
        <p class="text-lg font-bold text-danger">User not found</p>
        <button @click="$router.push('/')" class="btn-secondary">Go Back Home</button>
    </div>

    <!-- Edit Modal -->
    <transition name="fade">
        <EditProfileModal v-if="showEditModal" @close="showEditModal = false" />
    </transition>

  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
