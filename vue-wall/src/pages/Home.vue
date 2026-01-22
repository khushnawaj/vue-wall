<script setup>
import { onMounted, ref } from "vue";
import { useArtStore } from "@/store/artStore";
import FeedPost from "@/components/post/FeedPost.vue";
import SkeletonPost from "@/components/post/SkeletonPost.vue";

const store = useArtStore();
const isLoading = ref(true);

onMounted(async () => {
    isLoading.value = true;
    await store.fetchGallery();
    isLoading.value = false;
});
</script>

<template>
  <div class="w-full max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
    
    <!-- Hero / Welcome -->
    <div class="mb-16 mt-8 md:mt-12">
        <h1 class="text-5xl md:text-7xl font-heading font-extrabold mb-6 text-text tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-1000">
          Curating the <span class="text-accent italic">Future</span> of Art.
        </h1>
        <p class="text-text-soft font-medium text-lg md:text-xl max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          A decentralized space where pixels become poetry and creators define the canvas.
        </p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
        <SkeletonPost v-for="i in 8" :key="i" />
    </div>

    <!-- Masonry Feed (Fluid) -->
    <div v-else class="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
      <FeedPost
        v-for="post in store.posts"
        :key="post._id"
        :post="post"
        class="break-inside-avoid mb-6"
      />
    </div>
      
    <!-- Loading / Empty States -->
    <div v-if="store.posts.length === 0" class="text-center py-20 text-text-muted">
        <h3 class="text-2xl font-serif italic mb-2">The canvas is blank...</h3>
        <p>Be the first to create a masterpiece.</p>
    </div>

  </div>
</template>
