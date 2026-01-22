<script setup>
import { computed } from "vue";
import { useArtStore } from "@/store/artStore";
import { useAuthStore } from "@/store/authStore";
import { Heart } from "lucide-vue-next";

const store = useArtStore();
const authStore = useAuthStore();

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
});

/* --------------------
   LIKE STATE
-------------------- */
const isLiked = computed(() =>
  props.post.likes?.includes(authStore.user?._id)
);

const likesCount = computed(() =>
  props.post.likesCount ?? props.post.likes?.length ?? 0
);
</script>

<template>
  <article
    @click="store.openPost(post)"
    class="
      group relative cursor-zoom-in
      rounded-2xl overflow-hidden
      bg-bg-soft
      border border-border
      transition-all duration-300
      hover:-translate-y-1
      hover:shadow-xl
    "
  >
    <!-- Image -->
    <div class="relative overflow-hidden aspect-square">
      <img
        :src="post.imageUrl"
        loading="lazy"
        alt="Artwork"
        class="
          w-full h-full object-cover
          transition-transform duration-500
          group-hover:scale-[1.04]
        "
      />
    </div>

    <!-- Overlay on hover -->
    <div
      class="
        absolute inset-0 bg-black/50 opacity-0
        group-hover:opacity-100 transition-opacity duration-300
        flex items-center justify-center
      "
    >
      <div class="flex items-center gap-2 text-white">
        <Heart
          :class="isLiked ? 'fill-red-500 text-red-500' : 'text-white'"
          class="w-6 h-6"
        />
        <span class="font-semibold">{{ likesCount }}</span>
      </div>
    </div>

    <!-- Meta -->
    <div
      class="flex items-center justify-between px-4 py-3"
      @click.stop
    >
      <button
        @click.stop="store.likePost(post._id)"
        class="
          flex items-center gap-2
          text-sm transition hover:scale-105
        "
        :class="isLiked ? 'text-red-500' : 'text-text-soft'"
      >
        <Heart
          :class="isLiked ? 'fill-red-500' : ''"
          class="w-5 h-5"
        />
        <span>{{ likesCount }}</span>
      </button>

      <span class="text-xs text-text-muted font-medium">
        {{ post.owner?.name || "artist" }}
      </span>
    </div>

    <!-- Caption -->
    <p
      v-if="post.caption"
      class="px-4 pb-4 text-sm text-text-soft leading-relaxed"
    >
      {{ post.caption }}
    </p>
  </article>
</template>
