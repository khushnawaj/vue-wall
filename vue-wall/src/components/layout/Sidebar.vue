<script setup>
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

const navItems = [
  { label: "Feed", path: "/" },
  { label: "Popular", path: "/popular", disabled: true },
  { label: "Challenges", path: "/challenges", disabled: true },
  { label: "Collections", path: "/collections", disabled: true },
  { label: "Messages", path: "/messages", disabled: true },
  { label: "Profile", path: "/profile" },
];

function go(path, disabled) {
  if (!disabled) router.push(path);
}
</script>

<template>
  <aside
    class="
      h-full
      px-6 py-8
      flex flex-col
      gap-6
      text-sm
      bg-bg-soft/40
      backdrop-blur
      transition-colors duration-300
    "
  >
    <!-- Section title -->
    <div class="text-text-muted uppercase tracking-wider text-xs">
      Navigation
    </div>

    <!-- Nav items -->
    <ul class="flex flex-col gap-2">
      <li
        v-for="item in navItems"
        :key="item.label"
      >
        <button
          @click="go(item.path, item.disabled)"
          class="
            w-full
            text-left
            px-3 py-2
            rounded-lg
            transition
            flex items-center gap-2
          "
          :class="[
            route.path === item.path
              ? 'bg-bg-muted text-text'
              : 'text-text-soft hover:text-text hover:bg-bg-muted/60',
            item.disabled && 'opacity-40 cursor-not-allowed'
          ]"
        >
          <span class="inline-block w-2 h-2 rounded-full
            bg-accent
            transition-opacity"
            :class="route.path === item.path ? 'opacity-100' : 'opacity-0'"
          />
          {{ item.label }}
        </button>
      </li>
    </ul>

    <!-- Footer hint -->
    <div class="mt-auto text-xs text-text-muted leading-relaxed">
      A curated space for visual stories and unfinished ideas.
    </div>
  </aside>
</template>
