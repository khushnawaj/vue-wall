<template>
  <div class="mb-6 break-inside-avoid animate-pulse">
    <div class="rounded-xl bg-bg-muted w-full" :style="{ height: randomHeight + 'px' }"></div>
    <div class="mt-3 space-y-2">
        <div class="h-4 bg-bg-muted rounded w-3/4"></div>
        <div class="flex items-center gap-2">
            <div class="w-5 h-5 rounded-full bg-bg-muted"></div>
            <div class="h-3 bg-bg-muted rounded w-1/4"></div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
const randomHeight = computed(() => Math.floor(Math.random() * (400 - 250 + 1)) + 250);
</script>
