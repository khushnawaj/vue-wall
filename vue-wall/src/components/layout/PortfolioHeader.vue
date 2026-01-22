<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { Menu, X } from "lucide-vue-next";

const router = useRouter();
const isScrolled = ref(false);
const isMobileMenuOpen = ref(false);

const navItems = [
  { name: "HOME", path: "/" },
  { name: "ABOUT THE ARTIST", path: "/about" }, // Placeholder
  { name: "ARTWORKS", path: "/gallery" }, // Placeholder
  { name: "NEWS & AWARDS", path: "/news" }, // Placeholder
  { name: "CONTACT", path: "/contact" } // Placeholder
];

function handleScroll() {
  isScrolled.value = window.scrollY > 50;
}

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});

function goTo(path) {
  router.push(path);
  isMobileMenuOpen.value = false;
}
</script>

<template>
  <header 
    class="fixed top-0 w-full z-50 transition-all duration-300 border-b border-transparent"
    :class="isScrolled ? 'bg-[var(--bg-midnight)] shadow-md py-2' : 'bg-transparent py-4 bg-gradient-to-b from-black/60 to-transparent'"
  >
    <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
      
      <!-- Signature Logo -->
      <div 
        class="font-signature text-3xl md:text-4xl text-white cursor-pointer select-none"
        @click="goTo('/')"
      >
        Kannan Chithralaya
      </div>

      <!-- Desktop Nav -->
      <nav class="hidden md:flex items-center gap-8">
        <button
          v-for="item in navItems"
          :key="item.name"
          @click="goTo(item.path)"
          class="text-xs font-bold tracking-[2px] text-white hover:text-[var(--accent-gold)] transition-colors"
        >
          {{ item.name }}
        </button>
      </nav>

      <!-- Mobile Menu Toggle -->
      <button class="md:hidden text-white" @click="isMobileMenuOpen = !isMobileMenuOpen">
        <Menu v-if="!isMobileMenuOpen" :size="28" />
        <X v-else :size="28" />
      </button>

    </div>

    <!-- Mobile Dropdown -->
    <transition name="slide-down">
        <div v-if="isMobileMenuOpen" class="md:hidden bg-[var(--bg-midnight)] text-white absolute w-full left-0 top-full shadow-lg">
            <div class="flex flex-col py-4">
                 <button
                    v-for="item in navItems"
                    :key="item.name"
                    @click="goTo(item.path)"
                    class="py-4 border-b border-white/10 text-xs font-bold tracking-[2px] hover:bg-white/5"
                >
                {{ item.name }}
                </button>
            </div>
        </div>
    </transition>
  </header>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease-out;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
