<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/store/authStore";
import { X, Camera, Loader2 } from "lucide-vue-next";

const emit = defineEmits(["close"]);
const authStore = useAuthStore();

const name = ref(authStore.user?.name || "");
const bio = ref(authStore.user?.bio || "");
const avatarFile = ref(null);
const avatarPreview = ref(authStore.user?.avatar || "");
const isSubmitting = ref(false);
const uploadProgress = ref(0);

function handleFileChange(e) {
  const file = e.target.files[0];
  if (file) {
    avatarFile.ref = file;
    avatarPreview.value = URL.createObjectURL(file);
    avatarFile.value = file;
  }
}

async function handleSubmit() {
  if (isSubmitting.value) return;
  isSubmitting.value = true;

  try {
    await authStore.updateProfile({
      name: name.value,
      bio: bio.value,
      avatar: avatarFile.value
    }, (progress) => {
      uploadProgress.value = progress;
    });
    emit("close");
  } catch (err) {
    console.error("Update failed", err);
    alert("Failed to update profile. Please try again.");
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div 
        class="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
        @click="emit('close')"
    ></div>

    <!-- Modal Content -->
    <div class="relative bg-bg-soft w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden border border-white/10 animate-in fade-in zoom-in duration-300">
      
      <!-- Header -->
      <div class="px-8 py-6 border-b border-border flex items-center justify-between">
        <h2 class="text-2xl font-heading font-bold text-text">Edit Profile</h2>
        <button 
            @click="emit('close')"
            class="p-2 rounded-full hover:bg-bg-muted transition-colors text-text-soft"
        >
            <X :size="20" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="p-8 space-y-6">
        
        <!-- Avatar Upload -->
        <div class="flex flex-col items-center gap-4">
            <div class="relative group cursor-pointer" @click="$refs.fileInput.click()">
                <div class="w-24 h-24 rounded-full overflow-hidden border-2 border-accent p-1 bg-bg shadow-lg">
                    <img 
                        v-if="avatarPreview" 
                        :src="avatarPreview" 
                        class="w-full h-full object-cover rounded-full"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center bg-bg-muted text-text-muted">
                        <Camera :size="32" />
                    </div>
                </div>
                
                <!-- Overlay -->
                <div class="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera class="text-white" :size="24" />
                </div>
                
                <input 
                    type="file" 
                    ref="fileInput" 
                    class="hidden" 
                    accept="image/*"
                    @change="handleFileChange"
                />
            </div>
            <p class="text-xs font-semibold text-accent uppercase tracking-widest">Change Photo</p>
        </div>

        <!-- Inputs -->
        <div class="space-y-4">
            <div>
                <label class="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Display Name</label>
                <input 
                    v-model="name"
                    type="text"
                    required
                    placeholder="Enter your name"
                    class="w-full px-5 py-3 rounded-2xl bg-bg-muted border border-transparent focus:border-accent focus:bg-bg outline-none transition-all text-sm"
                />
            </div>

            <div>
                <label class="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Bio</label>
                <textarea 
                    v-model="bio"
                    rows="4"
                    placeholder="Tell us about yourself..."
                    class="w-full px-5 py-3 rounded-2xl bg-bg-muted border border-transparent focus:border-accent focus:bg-bg outline-none transition-all text-sm resize-none"
                ></textarea>
            </div>
        </div>

        <!-- Progress Bar (Visible during upload) -->
        <div v-if="uploadProgress > 0 && uploadProgress < 100" class="w-full bg-bg-muted h-1 rounded-full overflow-hidden">
             <div class="bg-accent h-full transition-all duration-300" :style="{ width: uploadProgress + '%' }"></div>
        </div>

        <!-- Footer Actions -->
        <div class="flex gap-3 pt-2">
            <button 
                type="button"
                @click="emit('close')"
                class="flex-1 px-6 py-3 rounded-2xl font-bold text-sm bg-bg-muted text-text-soft hover:bg-white/10 transition-colors"
                :disabled="isSubmitting"
            >
                Cancel
            </button>
            <button 
                type="submit"
                class="flex-2 flex items-center justify-center gap-2 px-10 py-3 rounded-2xl font-bold text-sm bg-accent text-white hover:shadow-lg hover:shadow-accent/30 transition-all disabled:opacity-50"
                :disabled="isSubmitting"
            >
                <Loader2 v-if="isSubmitting" class="animate-spin" :size="18" />
                {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
            </button>
        </div>
      </form>

    </div>
  </div>
</template>
