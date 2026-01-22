<script setup>
import { useArtStore } from "@/store/artStore";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "vue-router";
import { X, Palette, Download, Trash2, Bookmark, MessageCircle, Send, Edit2, Link } from "lucide-vue-next";
import { useToastStore } from "@/store/toastStore";
import { computed, ref, watch } from "vue";

const store = useArtStore();
const authStore = useAuthStore();
const router = useRouter();

const newComment = ref("");
const isSubmitting = ref(false);
const replyTarget = ref(null);

const editingCommentId = ref(null);
const editText = ref("");

const isSaved = computed(() => authStore.user?.savedArtworks?.includes(store.focusedPost?._id));

// Computed: organize comments into a tree (flat for now but with parent info)
const comments = computed(() => store.comments[store.focusedPost?._id] || []);

const rootComments = computed(() => comments.value.filter(c => !c.parentComment));
const getReplies = (commentId) => comments.value.filter(c => c.parentComment === commentId);

watch(() => store.focusedPost, (newPost) => {
  if (newPost) {
    store.fetchComments(newPost._id);
    replyTarget.value = null;
    editingCommentId.value = null;
  }
}, { immediate: true });

function setReply(comment) {
    replyTarget.value = comment;
    editingCommentId.value = null;
    newComment.value = `@${comment.user.name} `;
}

function startEdit(comment) {
    editingCommentId.value = comment._id;
    editText.value = comment.text;
    replyTarget.value = null;
}

async function saveEdit() {
    if (!editText.value.trim()) return;
    await store.updateComment(editingCommentId.value, editText.value);
    editingCommentId.value = null;
    editText.value = "";
}

async function handleDeleteComment(commentId) {
    if (confirm("Delete this comment?")) {
        await store.deleteComment(commentId, store.focusedPost._id);
    }
}

async function handleShare() {
    const url = `${window.location.origin}/art/${store.focusedPost._id}`;
    try {
        await navigator.clipboard.writeText(url);
        useToastStore().success("Link copied to clipboard!");
    } catch (err) {
        console.error("Failed to copy", err);
    }
}

async function postComment() {
  if (!newComment.value.trim() || isSubmitting.value) return;
  isSubmitting.value = true;
  try {
    await store.postComment(store.focusedPost._id, newComment.value, replyTarget.value?._id);
    newComment.value = "";
    replyTarget.value = null;
  } catch (e) {
    console.error(e);
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <Transition name="fade">
    <div
      v-if="store.focusedPost"
      class="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-0 md:p-8"
      @click.self="store.closePost()"
    >
      <!-- CLOSE BUTTON (TOP RIGHT) -->
      <button
        @click="store.closePost()"
        class="absolute top-4 right-4 md:top-6 md:right-6 text-white/60 hover:text-white transition-colors z-[100] bg-black/20 md:bg-transparent rounded-full p-1"
      >
        <X :size="28" />
      </button>

      <div class="bg-bg-soft w-full h-full md:max-w-6xl md:h-[85vh] md:rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-scale-in">
        
        <!-- LEFT: IMAGE SECTION -->
        <div class="flex-[1.2] lg:flex-[1.5] bg-black flex items-center justify-center relative group min-h-[45vh] md:min-h-0 border-b md:border-b-0 md:border-r border-border/10">
          <img
            :src="store.focusedPost.imageUrl"
            class="max-w-full max-h-full object-contain"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
        </div>

        <!-- RIGHT: INFO & COMMENTS -->
        <div class="flex-1 flex flex-col bg-bg border-l border-border h-full overflow-hidden">
            
            <!-- Header (Owner Info) -->
            <div class="p-6 border-b border-border flex items-center justify-between shrink-0">
                <div 
                    class="flex items-center gap-3 cursor-pointer group/owner"
                    @click="router.push(`/profile/${store.focusedPost.owner?._id || store.focusedPost.owner}`); store.closePost()"
                >
                    <div class="w-10 h-10 rounded-full bg-accent/10 overflow-hidden border border-border group-hover/owner:border-accent transition-colors">
                        <img v-if="store.focusedPost.owner?.avatar" :src="store.focusedPost.owner.avatar" class="w-full h-full object-cover">
                        <div v-else class="w-full h-full flex items-center justify-center text-accent font-bold">
                            {{ (store.focusedPost.owner?.name || 'A').charAt(0) }}
                        </div>
                    </div>
                    <div>
                        <h4 class="font-heading font-extrabold text-text text-sm tracking-tight group-hover/owner:text-accent transition-colors">{{ store.focusedPost.owner?.name || 'Anonymous' }}</h4>
                        <p class="text-[10px] text-text-muted font-bold uppercase tracking-widest">Creator</p>
                    </div>
                </div>

                <div class="flex items-center gap-1">
                    <button 
                        @click="store.toggleSaveArt(store.focusedPost._id)"
                        class="p-2.5 rounded-full hover:bg-bg-muted transition-colors"
                        :class="isSaved ? 'text-accent' : 'text-text-muted'"
                    >
                        <Bookmark :size="20" :fill="isSaved ? 'currentColor' : 'none'" />
                    </button>
                    <button 
                        v-if="store.focusedPost.owner?._id === authStore.user?._id"
                        @click="store.deleteArtwork(store.focusedPost._id)"
                        class="p-2.5 rounded-full hover:bg-danger/10 hover:text-danger text-text-muted transition-colors"
                    >
                        <Trash2 :size="20" />
                    </button>
                    <a :href="store.focusedPost.imageUrl" download class="p-2.5 rounded-full hover:bg-bg-muted text-text-muted transition-colors" title="Download">
                        <Download :size="20" />
                    </a>
                    <button @click="handleShare" class="p-2.5 rounded-full hover:bg-bg-muted text-text-muted transition-colors" title="Share">
                        <Link :size="20" />
                    </button>
                </div>
            </div>

            <!-- Scrollable Content -->
            <div class="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                <!-- Caption -->
                <div v-if="store.focusedPost.caption">
                    <h3 class="font-heading font-extrabold text-2xl text-text tracking-tighter mb-2">{{ store.focusedPost.caption }}</h3>
                    <p class="text-[15px] text-text-soft leading-relaxed">{{ store.focusedPost.caption }}</p>
                </div>

                <!-- Comments List -->
                <div class="space-y-6">
                    <h5 class="text-[11px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
                        <MessageCircle :size="14" /> Comments ({{ store.focusedPost.commentCount || 0 }})
                    </h5>
                    
                    <div v-if="comments.length === 0" class="py-10 text-center text-text-muted italic text-sm">
                        No comments yet. Start the conversation.
                    </div>

                    <!-- Root Comments Loop -->
                    <div v-for="comment in rootComments" :key="comment._id" class="space-y-4">
                        <div class="flex gap-4 group/comment">
                            <div class="w-8 h-8 rounded-full bg-accent/5 overflow-hidden shrink-0 border border-border">
                                <img v-if="comment.user?.avatar" :src="comment.user.avatar" class="w-full h-full object-cover">
                                <div v-else class="w-full h-full flex items-center justify-center text-[10px] font-bold text-accent">
                                    {{ comment.user?.name?.charAt(0) }}
                                </div>
                            </div>
                            <div class="flex-1">
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="text-xs font-bold text-text cursor-pointer hover:underline" @click="router.push(`/profile/${comment.user?._id}`); store.closePost()">{{ comment.user?.name }}</span>
                                    <span class="text-[10px] text-text-muted">Just now</span>
                                </div>
                                
                                <div v-if="editingCommentId === comment._id" class="mt-2">
                                    <input v-model="editText" @keyup.enter="saveEdit" class="w-full bg-bg border border-border px-3 py-1.5 rounded-lg text-sm mb-2 focus:outline-none focus:ring-1 focus:ring-accent" />
                                    <div class="flex gap-2">
                                        <button @click="saveEdit" class="text-[10px] font-bold text-accent">SAVE</button>
                                        <button @click="editingCommentId = null" class="text-[10px] font-bold text-text-muted">CANCEL</button>
                                    </div>
                                </div>
                                <p v-else class="text-[13px] text-text-soft leading-relaxed">{{ comment.text }}</p>
                                
                                <div v-if="!editingCommentId" class="flex gap-4 mt-2">
                                    <button @click="setReply(comment)" class="text-[10px] font-bold text-text-muted hover:text-accent transition-colors uppercase tracking-wider">Reply</button>
                                    <template v-if="comment.user?._id === authStore.user?._id">
                                        <button @click="startEdit(comment)" class="text-[10px] font-bold text-text-muted hover:text-accent transition-colors uppercase tracking-wider">Edit</button>
                                        <button @click="handleDeleteComment(comment._id)" class="text-[10px] font-bold text-text-muted hover:text-danger transition-colors uppercase tracking-wider">Delete</button>
                                    </template>
                                </div>
                            </div>
                        </div>

                        <!-- Replies Loop (Indented) -->
                        <div v-for="reply in getReplies(comment._id)" :key="reply._id" class="flex gap-4 ml-10 group/reply">
                            <div class="w-6 h-6 rounded-full bg-accent/5 overflow-hidden shrink-0 border border-border">
                                <img v-if="reply.user?.avatar" :src="reply.user.avatar" class="w-full h-full object-cover">
                                <div v-else class="w-full h-full flex items-center justify-center text-[8px] font-bold text-accent">
                                    {{ reply.user?.name?.charAt(0) }}
                                </div>
                            </div>
                            <div class="flex-1">
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="text-[11px] font-bold text-text cursor-pointer hover:underline" @click="router.push(`/profile/${reply.user?._id}`); store.closePost()">{{ reply.user?.name }}</span>
                                    <span class="text-[10px] text-text-muted">Just now</span>
                                </div>

                                <div v-if="editingCommentId === reply._id" class="mt-2">
                                    <input v-model="editText" @keyup.enter="saveEdit" class="w-full bg-bg border border-border px-3 py-1.5 rounded-lg text-sm mb-2 focus:outline-none focus:ring-1 focus:ring-accent" />
                                    <div class="flex gap-2">
                                        <button @click="saveEdit" class="text-[10px] font-bold text-accent">SAVE</button>
                                        <button @click="editingCommentId = null" class="text-[10px] font-bold text-text-muted">CANCEL</button>
                                    </div>
                                </div>
                                <p v-else class="text-[12px] text-text-soft leading-relaxed">{{ reply.text }}</p>

                                <div v-if="!editingCommentId" class="flex gap-4 mt-2">
                                    <button @click="setReply(comment)" class="text-[10px] font-bold text-text-muted hover:text-accent transition-colors uppercase tracking-wider">Reply</button>
                                    <template v-if="reply.user?._id === authStore.user?._id">
                                        <button @click="startEdit(reply)" class="text-[10px] font-bold text-text-muted hover:text-accent transition-colors uppercase tracking-wider">Edit</button>
                                        <button @click="handleDeleteComment(reply._id)" class="text-[10px] font-bold text-text-muted hover:text-danger transition-colors uppercase tracking-wider">Delete</button>
                                    </template>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer Interaction -->
            <div class="p-6 border-t border-border bg-bg-soft shrink-0">
                
                <!-- Reply Box / Status -->
                <div v-if="replyTarget" class="mb-4 flex items-center justify-between bg-bg p-3 rounded-xl border border-border animate-in slide-in-from-bottom-2">
                    <p class="text-[11px] font-bold text-text-soft">
                        Replying to <span class="text-accent">@{{ replyTarget.user.name }}</span>
                    </p>
                    <button @click="replyTarget = null; newComment = ''" class="text-text-muted hover:text-text">
                        <X :size="14" />
                    </button>
                </div>
                <div class="flex items-center justify-between mb-4">
                    <button 
                        @click="store.likePost(store.focusedPost._id)"
                        class="flex items-center gap-2 text-sm font-bold"
                        :class="store.focusedPost.likes?.includes(authStore.user?._id) ? 'text-accent' : 'text-text'"
                    >
                        <Palette :size="20" :fill="store.focusedPost.likes?.includes(authStore.user?._id) ? 'currentColor' : 'none'" />
                        {{ store.focusedPost.likes?.length || 0 }} appreciations
                    </button>
                </div>

                <div class="relative">
                    <input 
                        v-model="newComment"
                        type="text" 
                        placeholder="Add a comment..." 
                        class="w-full bg-bg border border-border px-4 py-3 pr-12 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all font-medium"
                        @keyup.enter="postComment"
                    />
                    <button 
                        @click="postComment"
                        :disabled="!newComment.trim() || isSubmitting"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-accent p-1.5 hover:bg-accent/10 rounded-lg transition-all disabled:opacity-30"
                    >
                        <Send :size="18" />
                    </button>
                </div>
            </div>

        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.animate-scale-in {
    animation: scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes scaleIn {
    from { transform: scale(0.95); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
}

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }
</style>
