<template>
  <!-- Background wrapper -->
  <div
    class="
      min-h-screen w-full
      flex items-center justify-center
      bg-gradient-to-br
      from-bg-muted to-bg
      transition-colors duration-300
    "
  >
    <!-- Glass container -->
    <div
      class="
        relative
        w-full h-full
        max-w-[1440px]
        min-h-screen lg:min-h-[85vh]
        bg-bg/80 backdrop-blur-xl
        border border-border
        rounded-none lg:rounded-2xl
        shadow-2xl
        flex flex-col
        overflow-hidden
        animate-fadeIn
      "
    >
      <!-- Top Navigation -->
      <TopNav />

      <!-- Body -->
      <div class="flex flex-1 overflow-hidden">
        <!-- Sidebar (hidden on small screens) -->
        <aside
          class="
            hidden lg:block
            w-64
            border-r border-border
            bg-bg-soft/60
            backdrop-blur
          "
        >
          <Sidebar />
        </aside>

        <!-- Main Content -->
        <main
          class="
            flex-1
            overflow-y-auto
            px-4 sm:px-6 lg:px-10
            py-6
          "
        >
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import TopNav from "@/components/layout/TopNav.vue";
import Sidebar from "@/components/layout/Sidebar.vue";
</script>

<style scoped>
/* subtle entry animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.6s ease-out forwards;
}
</style>
