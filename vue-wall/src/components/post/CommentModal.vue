<script setup>
import { ref, onMounted, computed, nextTick } from "vue";
import { useArtStore } from "@/store/artStore";
import { useAuthStore } from "@/store/authStore";
import { X, Send } from "lucide-vue-next";

const props = defineProps({
  artworkId: { type: String, required: true },
  isOpen: { type: Boolean, default: false }
});

const emit = defineEmits(["close"]);

const store = useArtStore();
const authStore = useAuthStore();

const newComment = ref("");
const loading = ref(false);
const commentsContainer = ref(null);

// Get comments from store based on ID
const comments = computed(() => store.comments[props.artworkId] || []);

onMounted(() => {
    if (props.artworkId) {
        store.fetchComments(props.artworkId);
    }
});

async function handleSubmit() {
    if (!newComment.value.trim()) return;
    
    loading.value = true;
    try {
        await store.postComment(props.artworkId, newComment.value);
        newComment.value = "";
        
        // Scroll to top
        if (commentsContainer.value) {
            commentsContainer.value.scrollTop = 0;
        }
    } catch (e) {
        alert("Failed to post comment");
    } finally {
        loading.value = false;
    }
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm" @click.self="emit('close')">
    
    <div class="w-full md:w-[500px] h-[80vh] md:h-[600px] bg-bg rounded-t-2xl md:rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-slide-up md:animate-scale-in">
        
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-border">
            <h3 class="font-heading font-bold text-xl">Comments</h3>
            <button @click="emit('close')" class="p-2 hover:bg-bg-muted rounded-full transition">
                <X :size="20" />
            </button>
        </div>

        <!-- Comments List -->
        <div ref="commentsContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
            <div v-if="comments.length === 0" class="text-center text-text-muted py-10">
                No comments yet. Be the first to start the conversation!
            </div>

            <div v-for="comment in comments" :key="comment._id" class="flex gap-3">
                 <div class="w-8 h-8 rounded-full bg-accent/20 shrink-0 overflow-hidden">
                     <img v-if="comment.user?.avatar" :src="comment.user.avatar" class="w-full h-full object-cover">
                     <div v-else class="w-full h-full flex items-center justify-center text-xs font-bold text-accent">
                         {{ comment.user?.name?.charAt(0) }}
                     </div>
                 </div>
                 <div class="flex-1">
                     <div class="bg-bg-muted/50 p-3 rounded-2xl rounded-tl-none">
                         <span class="font-bold text-sm block mb-0.5">{{ comment.user?.name }}</span>
                         <p class="text-sm leading-relaxed">{{ comment.text }}</p>
                     </div>
                     <span class="text-[10px] text-text-muted ml-2 mt-1 block">Just now</span> 
                     <!-- Note: Proper date diffs would need a helper function -->
                 </div>
            </div>
        </div>

        <!-- Input Area -->
        <div class="p-4 border-t border-border bg-bg-soft">
            <form @submit.prevent="handleSubmit" class="flex gap-2">
                <input 
                    v-model="newComment"
                    type="text" 
                    placeholder="Add a comment..." 
                    class="flex-1 bg-bg-muted px-4 py-3 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-accent transition"
                    :disabled="loading"
                />
                <button 
                    type="submit" 
                    class="p-3 bg-accent text-white rounded-full hover:shadow-lg disabled:opacity-50 transition"
                    :disabled="loading || !newComment.trim()"
                >
                    <Send :size="18" />
                </button>
            </form>
        </div>

    </div>
  </div>
</template>

<style scoped>
.animate-slide-up {
    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
}

@media (min-width: 768px) {
    .animate-scale-in {
        animation: scaleIn 0.2s ease-out;
    }
    @keyframes scaleIn {
        from { transform: scale(0.95); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
    }
}
</style>
