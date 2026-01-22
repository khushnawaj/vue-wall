<template>
  <div class="w-full max-w-4xl mx-auto py-12 px-4 flex flex-col items-center">
    <div v-if="loading" class="py-24 flex flex-col items-center gap-4">
        <div class="loader"></div>
        <p class="text-xs font-bold text-text-muted uppercase tracking-widest">Finding artwork...</p>
    </div>
    <div v-else-if="artwork" class="w-full">
        <!-- Reusing behavior but on a page -->
        <div class="bg-bg-soft rounded-3xl border border-border overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[600px]">
            <div class="flex-1 bg-black flex items-center justify-center">
                <img :src="artwork.imageUrl" class="max-w-full max-h-[80vh] object-contain">
            </div>
            <div class="w-full md:w-80 p-8 border-l border-border bg-bg flex flex-col">
                <div class="flex items-center gap-3 mb-8 cursor-pointer" @click="$router.push(`/profile/${artwork.owner._id}`)">
                    <div class="w-10 h-10 rounded-full bg-bg-muted overflow-hidden border border-border">
                        <img v-if="artwork.owner.avatar" :src="artwork.owner.avatar" class="w-full h-full object-cover">
                    </div>
                    <div>
                        <h4 class="font-bold text-sm">{{ artwork.owner.name }}</h4>
                        <p class="text-[10px] text-text-muted font-bold uppercase">Artist</p>
                    </div>
                </div>
                <h1 class="text-2xl font-heading font-extrabold mb-4">{{ artwork.caption || 'Untitled' }}</h1>
                <p class="text-text-soft text-sm mb-8">{{ artwork.caption }}</p>

                <div class="mt-auto flex flex-col gap-4">
                     <button @click="artStore.openPost(artwork)" class="btn-primary w-full py-3 rounded-2xl font-bold text-sm">Open in Focus Mode</button>
                     <button @click="$router.push('/')" class="btn-secondary w-full py-3 rounded-2xl font-bold text-sm">Back to Gallery</button>
                </div>
            </div>
        </div>
    </div>
    <div v-else class="py-24 text-center">
        <h2 class="text-2xl font-bold mb-4">Artwork not found</h2>
        <button @click="$router.push('/')" class="text-accent underline">Return home</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import api from "@/services/api";
import { useArtStore } from "@/store/artStore";

const route = useRoute();
const artStore = useArtStore();
const artwork = ref(null);
const loading = ref(true);

onMounted(async () => {
    try {
        const res = await api.get(`/artworks/${route.params.id}`);
        artwork.value = res.data;
    } catch (err) {
        console.error(err);
    } finally {
        loading.value = false;
    }
});
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
@keyframes spin { to { transform: rotate(360deg); } }
</style>
