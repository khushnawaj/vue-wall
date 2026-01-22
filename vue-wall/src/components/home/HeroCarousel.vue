<script setup>
import { ref, onMounted } from 'vue';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';

// Placeholder Images - Replace with real gallery images
const slides = [
  {
    id: 1,
    image: 'https://picsum.photos/1920/1080?random=1',
    title: 'THE ART OF REALISM',
    subtitle: 'Kannan Chithralaya',
    cta: 'EXPLORE ART WORKS'
  },
  {
    id: 2,
    image: 'https://picsum.photos/1920/1080?random=2',
    title: 'CAPTURING SOULS',
    subtitle: 'Portrait Masterpieces',
    cta: 'VIEW PORTRAITS'
  }
];

const currentSlide = ref(0);

function nextSlide() {
  currentSlide.value = (currentSlide.value + 1) % slides.length;
}

function prevSlide() {
  currentSlide.value = (currentSlide.value - 1 + slides.length) % slides.length;
}

// Auto-advance
onMounted(() => {
  setInterval(nextSlide, 6000);
});
</script>

<template>
  <div class="relative w-full h-[85vh] overflow-hidden bg-[var(--bg-midnight)]">
    
    <!-- Slides -->
    <div 
        v-for="(slide, index) in slides" 
        :key="slide.id"
        class="absolute inset-0 transition-opacity duration-1000 ease-in-out"
        :class="index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'"
    >
        <!-- Background Image with Ken Burns Effect -->
        <div class="absolute inset-0 bg-cover bg-center animate-subtle-zoom" :style="{ backgroundImage: `url(${slide.image})` }"></div>
        
        <!-- Overlay -->
        <div class="absolute inset-0 bg-black/40"></div>

        <!-- Content -->
        <div class="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
             <h2 class="font-signature text-5xl md:text-7xl mb-4 animate-fade-in-up text-[var(--accent-gold)]">
                {{ slide.subtitle }}
            </h2>
            <h1 class="font-heading text-4xl md:text-6xl font-bold tracking-widest mb-8 animate-fade-in-up delay-100">
                {{ slide.title }}
            </h1>
           
            <button class="btn-primary animate-fade-in-up delay-200">
                {{ slide.cta }}
            </button>
        </div>
    </div>

    <!-- Controls -->
    <button 
        @click="prevSlide"
        class="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 text-white/50 hover:text-white transition"
    >
        <ChevronLeft :size="48" stroke-width="1" />
    </button>
    <button 
        @click="nextSlide"
        class="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 text-white/50 hover:text-white transition"
    >
        <ChevronRight :size="48" stroke-width="1" />
    </button>

  </div>
</template>

<style scoped>
@keyframes subtle-zoom {
    0% { transform: scale(1); }
    100% { transform: scale(1.1); }
}

.animate-subtle-zoom {
    animation: subtle-zoom 10s infinite alternate linear;
}

.animate-fade-in-up {
    animation: fadeInUp 0.8s ease-out forwards;
    opacity: 0;
    transform: translateY(20px);
}

.delay-100 { animation-delay: 0.1s; }
.delay-200 { animation-delay: 0.2s; }

@keyframes fadeInUp {
    to { opacity: 1; transform: translateY(0); }
}
</style>
