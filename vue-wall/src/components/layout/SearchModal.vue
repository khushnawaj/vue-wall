<template>
  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-[10000] flex items-start justify-center pt-24 px-4 bg-bg/80 backdrop-blur-xl" @click.self="$emit('close')">
      
      <div class="w-full max-w-2xl bg-bg-soft border border-border rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-top-4 duration-300">
        
        <!-- Search Input -->
        <div class="p-6 border-b border-border flex items-center gap-4">
            <Search :size="24" class="text-text-muted" />
            <input 
                ref="searchInput"
                v-model="query" 
                type="text" 
                placeholder="Search artists, art styles, or keywords..." 
                class="flex-1 bg-transparent text-xl font-heading font-bold text-text focus:outline-none placeholder:text-text-muted/30"
                @input="handleInput"
            />
            <button @click="$emit('close')" class="p-2 hover:bg-bg-muted rounded-full transition-colors">
                <X :size="20" />
            </button>
        </div>

        <!-- Results -->
        <div class="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
            
            <!-- Loading -->
            <div v-if="searchStore.loading" class="flex flex-col items-center py-12 gap-3">
                <div class="loader"></div>
                <p class="text-xs font-bold text-text-muted uppercase tracking-widest">Searching the gallery...</p>
            </div>

            <!-- Empty / Initial -->
            <div v-else-if="!query" class="py-12 text-center">
                <p class="text-text-soft font-medium">Type something to explore the wall.</p>
            </div>

            <div v-else-if="searchStore.results.artworks.length === 0 && searchStore.results.users.length === 0" class="py-12 text-center text-text-muted italic">
                No matches found for "{{ query }}".
            </div>

            <div v-else class="space-y-8">
                <!-- Users -->
                <div v-if="searchStore.results.users.length > 0">
                    <h4 class="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-4 px-2">Artists</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div 
                            v-for="user in searchStore.results.users" 
                            :key="user._id"
                            @click="goToProfile(user._id)"
                            class="flex items-center gap-3 p-3 rounded-2xl hover:bg-bg-muted cursor-pointer transition-all"
                        >
                            <div class="w-10 h-10 rounded-full overflow-hidden border border-border bg-bg-soft">
                                <img v-if="user.avatar" :src="user.avatar" class="w-full h-full object-cover">
                                <div v-else class="w-full h-full flex items-center justify-center font-bold text-accent">
                                    {{ user.name.charAt(0) }}
                                </div>
                            </div>
                            <div class="flex-1 min-w-0">
                                <h5 class="text-sm font-bold text-text truncate">{{ user.name }}</h5>
                                <p class="text-[11px] text-text-soft truncate">{{ user.bio || 'Digital Artist' }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Artworks -->
                <div v-if="searchStore.results.artworks.length > 0">
                    <h4 class="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-4 px-2">Artworks</h4>
                    <div class="grid grid-cols-3 gap-3 px-2">
                        <div 
                            v-for="art in searchStore.results.artworks" 
                            :key="art._id"
                            @click="openArt(art)"
                            class="aspect-square rounded-xl overflow-hidden border border-border cursor-pointer group relative"
                        >
                            <img :src="art.imageUrl" class="w-full h-full object-cover transition-transform group-hover:scale-110">
                            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Maximize :size="20" class="text-white" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
      </div>

    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import { useSearchStore } from "@/store/searchStore";
import { useArtStore } from "@/store/artStore";
import { useRouter } from "vue-router";
import { Search, X, Maximize } from "lucide-vue-next";

const props = defineProps({
  isOpen: Boolean
});

const emit = defineEmits(["close"]);

const searchStore = useSearchStore();
const artStore = useArtStore();
const router = useRouter();
const query = ref("");
const searchInput = ref(null);

let debounceTimeout = null;

function handleInput() {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
        searchStore.search(query.value);
    }, 400);
}

function goToProfile(id) {
    router.push(`/profile/${id}`);
    emit('close');
}

function openArt(art) {
    artStore.openPost(art);
    emit('close');
}

onMounted(() => {
    window.addEventListener("keydown", handleKeydown);
    focusInput();
});

onUnmounted(() => {
    window.removeEventListener("keydown", handleKeydown);
});

function handleKeydown(e) {
    if (e.key === "Escape") emit("close");
}

function focusInput() {
    nextTick(() => {
        if (searchInput.value) searchInput.value.focus();
    });
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.loader {
  width: 16px;
  height: 16px;
  border: 2px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }
</style>
