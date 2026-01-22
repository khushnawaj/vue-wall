<script setup>
import { useToastStore } from "@/store/toastStore";
import { CheckCircle, AlertCircle, Info, X } from "lucide-vue-next";

const toastStore = useToastStore();
</script>

<template>
  <div class="fixed top-6 left-1/2 -translate-x-1/2 z-[10000] flex flex-col gap-3 pointer-events-none w-full max-w-xs md:max-w-md">
    <TransitionGroup name="toast">
      <div 
        v-for="toast in toastStore.toasts" 
        :key="toast.id"
        class="
            pointer-events-auto
            flex items-center gap-3 px-4 py-3 rounded-2xl
            bg-bg-soft/90 backdrop-blur-xl border border-border shadow-2xl
            animate-in fade-in slide-in-from-top-4 duration-300
        "
      >
        <div class="shrink-0">
          <CheckCircle v-if="toast.type === 'success'" :size="20" class="text-green-500" />
          <AlertCircle v-else-if="toast.type === 'error'" :size="20" class="text-danger" />
          <Info v-else :size="20" class="text-accent" />
        </div>

        <p class="text-sm font-medium text-text flex-1">{{ toast.message }}</p>

        <button @click="toastStore.removeToast(toast.id)" class="text-text-muted hover:text-text transition-colors">
            <X :size="16" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.9);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}
</style>
