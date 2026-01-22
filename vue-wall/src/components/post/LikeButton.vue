<script setup>
import { computed } from "vue";
import { useArtStore } from "@/store/artStore";

const props = defineProps({
  post: {
    type: Object,
    required: true
  },
  currentUserId: {
    type: String,
    required: true
  }
});

const store = useArtStore();

/* --------------------
   COMPUTED STATE
-------------------- */
const isLiked = computed(() =>
  props.post.likes?.includes(props.currentUserId)
);

const likesCount = computed(() =>
  props.post.likesCount ?? props.post.likes?.length ?? 0
);

/* --------------------
   ACTION
-------------------- */
async function toggleLike() {
  await store.likePost(props.post._id);
}
</script>

<template>
  <button @click="toggleLike" class="like-btn">
    <span>{{ isLiked ? "❤️" : "🤍" }}</span>
    <small v-if="likesCount > 0">{{ likesCount }}</small>
  </button>
</template>

<style scoped>
.like-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
