<script setup>
import { useArtStore } from "@/store/artStore";
import ArtCard from "@/components/post/ArtCard.vue";

const emit = defineEmits(["open"]);
const store = useArtStore();
</script>

<template>
  <section
    class="
      w-full
      grid
      gap-5 sm:gap-6 lg:gap-8
      grid-cols-2
      sm:grid-cols-3
      md:grid-cols-4
      lg:grid-cols-5
      xl:grid-cols-6
    "
  >
    <ArtCard
      v-for="post in store.posts"
      :key="post.id"
      :post="post"
      @open="emit('open', $event)"
    />
  </section>
</template>
