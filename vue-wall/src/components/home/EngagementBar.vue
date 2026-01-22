<script setup>
import { Phone, ArrowRight } from 'lucide-vue-next';
</script>

<template>
  <div class="w-full bg-[#1BD741] py-8 px-6 text-white flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 skew-y-0 relative overflow-hidden">
    <!-- Decorative Pattern Overlay -->
    <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
    
    <div class="flex items-center gap-4 relative z-10">
        <div class="bg-white p-3 rounded-full text-[#1BD741]">
            <Phone :size="32" stroke-width="2.5" />
        </div>
        <div>
            <p class="text-sm font-bold opacity-90 tracking-wider">WHATSAPP INQUIRY</p>
            <p class="text-2xl font-black tracking-tight">+91 98765 43210</p>
        </div>
    </div>

    <div class="h-12 w-px bg-white/30 hidden md:block"></div>

    <button class="relative z-10 bg-white text-[#1BD741] px-8 py-4 rounded-full font-black text-lg tracking-wide hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-3">
        START RIGHT NOW
        <ArrowRight :size="20" stroke-width="3" />
    </button>
  </div>
</template>
