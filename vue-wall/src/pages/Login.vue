<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/authStore"; 
import Loader from "@/components/ui/Loader.vue";

const router = useRouter();
const authStore = useAuthStore();
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const email = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");

async function handleLogin() {
  if (!email.value || !password.value) {
    error.value = "Please enter email and password";
    return;
  }

  try {
    loading.value = true;
    error.value = "";

    await authStore.login({
      email: email.value,
      password: password.value
    });

    router.push("/");
  } catch (err) {
    error.value =
      err?.response?.data?.message || "Login failed. Try again.";
  } finally {
    loading.value = false;
  }
}
</script>


<template>
  <div class="min-h-screen flex items-center justify-center p-6 bg-bg relative overflow-hidden">
    <!-- Login Card -->
    <div
      class="w-full max-w-sm p-10
             bg-bg-soft border border-border
             rounded-[2.5rem] shadow-2xl animate-in fade-in zoom-in duration-700 z-10"
    >
      <div class="mb-10 text-center">
          <h1 class="text-3xl font-heading font-extrabold text-text tracking-tighter mb-2">
            Welcome back.
          </h1>
          <p class="text-sm font-medium text-text-muted">
            Let's get back to the canvas.
          </p>
      </div>

      <div class="space-y-4">
          <input
            v-model="email"
            placeholder="Email"
            class="input"
          />
          <input
            v-model="password"
            type="password"
            placeholder="Password"
            class="input"
          />
      </div>

      <!-- Error -->
      <p
        v-if="error"
        class="text-xs text-danger font-bold mt-4 px-2"
      >
        {{ error }}
      </p>

      <button
        class="login-btn mt-8 w-full py-4 rounded-2xl shadow-lg shadow-accent/20 flex items-center justify-center min-h-[56px]"
        :disabled="loading"
        @click="handleLogin"
      >
        <Loader v-if="loading" class="text-bg scale-75" />
        <span v-else>Continue</span>
      </button>

      <!-- DIVIDER -->
      <div class="flex items-center gap-4 my-8">
          <div class="h-px bg-border flex-1"></div>
          <span class="text-[10px] text-text-muted font-bold uppercase tracking-widest">Connect with</span>
          <div class="h-px bg-border flex-1"></div>
      </div>

      <!-- SOCIAL BUTTONS -->
      <div class="flex flex-col gap-3">
          <a :href="`${API_URL}/auth/google`" class="flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border border-border hover:bg-bg-muted transition text-xs font-bold text-text group relative overflow-hidden">
                <svg class="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
          </a>
      </div>

      <p class="text-[13px] text-text-muted mt-10 text-center font-medium">
        New here?
        <span
          class="text-accent cursor-pointer font-bold hover:underline"
          @click="router.push('/signup')"
        >
          Create an account
        </span>
      </p>
    </div>
  </div>
</template>

<style scoped>
.input {
  width: 100%;
  padding: 14px 20px;
  border-radius: 1rem;
  background: var(--bg);
  border: 1px solid var(--border);
  color: var(--text);
  font-size: 14px;
  font-weight: 500;
  outline: none;
  transition: all 0.2s ease;
}

.input:focus {
  border-color: var(--accent);
  background: var(--bg-soft);
  box-shadow: 0 0 0 4px var(--accent-glow);
}

.login-btn {
  background: var(--accent);
  color: var(--bg);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 13px;
  transition: all 0.3s ease;
}

.login-btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-2px);
}

.login-btn:disabled {
  opacity: 0.8;
  cursor: wait;
}
</style>
