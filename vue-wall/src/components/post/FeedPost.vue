<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useArtStore } from "@/store/artStore";
import { useAuthStore } from "@/store/authStore";
import { Palette, MessageCircle, MoreHorizontal, Bookmark } from "lucide-vue-next";
import CommentModal from "@/components/post/CommentModal.vue";
import LikeHeart from "@/components/post/LikeHeart.vue";

const store = useArtStore();
const authStore = useAuthStore();
const router = useRouter();

const props = defineProps({
  post: {
    type: Object,
    required: true,
  },
});

const isHovered = ref(false);
const showComments = ref(false);
const showHeart = ref(false);

const isLiked = computed(() => props.post.likes?.includes(authStore.user?._id));
const isSaved = computed(() => authStore.user?.savedArtworks?.includes(props.post._id));

// Simple Time Ago (Dynamic)
const timeAgo = computed(() => {
    if (!props.post.createdAt) return "RECENTLY";
    const date = new Date(props.post.createdAt);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " YEARS AGO";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " MONTHS AGO";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " DAYS AGO";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " HOURS AGO";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " MINUTES AGO";
    return "JUST NOW";
});

function handleLike() {
  if (!authStore.token) {
    alert("Please sign in to like artworks.");
    return;
  }
  if (!isLiked.value) {
    showHeart.value = true;
    setTimeout(() => showHeart.value = false, 800);
  }
  store.likePost(props.post._id);
}

function handleSave() {
    if (!authStore.token) {
        alert("Please sign in to save artworks.");
        return;
    }
    store.toggleSaveArt(props.post._id);
}

function handleComment() {
    if (!authStore.token) {
        alert("Please sign in to comment.");
        return;
    }
    showComments.value = true;
}
</script>

<template>
  <article 
    class="relative group break-inside-avoid mb-6"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!-- Artwork Card -->
    <div class="relative rounded-xl overflow-hidden bg-bg-soft border border-border shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
        <img
            :src="post.imageUrl"
            class="w-full h-auto object-cover cursor-pointer"
            alt="Artwork"
            loading="lazy"
            @click="store.openPost(post)"
            @dblclick="handleLike"
        />
        
        <LikeHeart :show="showHeart" />

        <!-- Gradient Overlay (Desktop) -->
        <div 
            class="hidden md:flex absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-col justify-end p-5"
        >
            <div class="flex items-center justify-between translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <div class="text-white">
                    <h3 class="font-heading font-medium text-xl leading-tight">{{ post.caption || 'Untitled' }}</h3>
                </div>

                <div class="flex items-center gap-1.5">
                     <button 
                        @click.stop="handleLike"
                        class="p-2.5 rounded-lg bg-white/10 backdrop-blur-md text-white hover:bg-white hover:text-accent transition-all flex items-center gap-2"
                        :class="{ '!bg-white !text-accent': isLiked }"
                    >
                        <Palette :size="18" :fill="isLiked ? 'currentColor' : 'none'" />
                        <span class="text-xs font-bold">{{ post.likes?.length || 0 }}</span>
                    </button>

                    <button 
                        @click.stop="handleComment"
                        class="p-2.5 rounded-lg bg-white/10 backdrop-blur-md text-white hover:bg-white hover:text-accent transition-all flex items-center gap-2"
                    >
                        <MessageCircle :size="18" />
                        <span class="text-xs font-bold">{{ post.commentCount || 0 }}</span>
                    </button>

                    <button 
                        @click.stop="handleSave"
                        class="p-2.5 rounded-lg bg-white/10 backdrop-blur-md text-white hover:bg-white hover:text-accent transition-all"
                        :class="{ '!bg-white !text-accent': isSaved }"
                    >
                        <Bookmark :size="18" :fill="isSaved ? 'currentColor' : 'none'" />
                    </button>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Info Section (Mobile Always Visible / Desktop Minimal) -->
    <div class="mt-3 px-1">
        <div class="flex justify-between items-start">
            <h3 class="font-heading font-semibold text-[15px] tracking-tight text-text truncate pr-4">{{ post.caption || 'Untitled' }}</h3>
             <div class="flex md:hidden items-center gap-3 text-text-soft">
                <div class="flex items-center gap-1" @click.stop="handleLike">
                    <Palette :size="18" :class="{ 'fill-accent text-accent': isLiked }" />
                    <span class="text-[10px] font-bold">{{ post.likes?.length || 0 }}</span>
                </div>
                <div class="flex items-center gap-1" @click.stop="handleComment">
                    <MessageCircle :size="18" />
                    <span class="text-[10px] font-bold">{{ post.commentCount || 0 }}</span>
                </div>
                <Bookmark :size="18" :class="{ 'fill-accent text-accent': isSaved }" @click.stop="handleSave" />
            </div>
        </div>
        
        <div class="flex items-center gap-2 mt-1">
            <div 
                class="w-5 h-5 rounded-full bg-bg-muted overflow-hidden cursor-pointer"
                @click="router.push(`/profile/${post.owner?._id || post.owner}`)"
            >
                <img v-if="post.owner?.avatar" :src="post.owner.avatar" class="w-full h-full object-cover">
                 <div v-else class="w-full h-full flex items-center justify-center text-[8px] font-bold text-text-muted bg-bg-muted">
                    {{ (post.owner?.name || 'A').charAt(0) }}
                 </div>
            </div>
            <p 
                class="text-xs text-text-soft font-medium cursor-pointer hover:text-accent transition-colors"
                @click="router.push(`/profile/${post.owner?._id || post.owner}`)"
            >
                {{ post.owner?.name || 'Anonymous' }}
            </p>
            <span class="text-[9px] text-text-muted font-bold tracking-wider ml-auto">{{ timeAgo }}</span>
        </div>
    </div>

    <!-- Modals -->
    <CommentModal 
        v-if="showComments" 
        :isOpen="showComments" 
        :artworkId="post._id" 
        @close="showComments = false" 
    />

  </article>
</template>
