<script setup>
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/store/authStore';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

onMounted(async () => {
    const token = route.query.token;
    if (token) {
        // Manually set token
        authStore.token = token;
        localStorage.setItem("artwall_token", token);
        
        // Fetch user data
        await authStore.fetchMe();
        
        // Redirect home
        router.push('/');
    } else {
        router.push('/login?error=no_token');
    }
});
</script>

<template>
    <div class="h-screen flex items-center justify-center bg-bg text-text">
        <div class="flex flex-col items-center gap-4">
             <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
             <p>Authenticating...</p>
        </div>
    </div>
</template>
