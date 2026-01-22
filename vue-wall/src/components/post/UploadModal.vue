<script setup>
import { ref } from "vue";
import { useArtStore } from "@/store/artStore";

const emit = defineEmits(["close"]);
const store = useArtStore();

const file = ref(null);
const preview = ref(null);
const caption = ref("");
const loading = ref(false);
const error = ref("");
const inputKey = ref(Date.now());

function onFileChange(e) {
  const selected = e.target.files[0];
  if (!selected) return;

  if (!selected.type.startsWith("image/")) {
    error.value = "Please select an image file";
    return;
  }

  file.value = selected;
  preview.value = URL.createObjectURL(selected);
  error.value = "";
}

async function publish() {
  if (!file.value || loading.value) return;

  try {
    loading.value = true;
    error.value = "";

    await store.uploadArtwork(file.value, caption.value);

    cleanup(true);
  } catch (err) {
    error.value =
      err?.response?.data?.message || "Upload failed. Try again.";
  } finally {
    loading.value = false;
  }
}

function cleanup(close = false) {
  if (preview.value) URL.revokeObjectURL(preview.value);

  file.value = null;
  preview.value = null;
  caption.value = "";
  error.value = "";
  inputKey.value = Date.now();

  if (close) emit("close");
}
</script>

<template>
  <!-- Overlay -->
  <div
    class="
      fixed inset-0 z-50
      bg-black/50 backdrop-blur-sm
      flex items-end sm:items-center justify-center
      px-2 sm:px-0
    "
    @click.self="!loading && cleanup(true)"
  >
    <!-- Modal -->
    <div
      class="
        w-full sm:max-w-lg
        bg-bg-soft
        border border-border
        rounded-2xl
        shadow-2xl
        overflow-hidden
        animate-modalIn
      "
    >
      <!-- Header -->
      <div class="px-6 py-5 border-b border-border flex items-center justify-between">
        <h2 class="text-lg font-heading font-extrabold text-text tracking-tight">
          New Artwork
        </h2>
        <button
          @click="cleanup(true)"
          :disabled="loading"
          class="p-2 rounded-full hover:bg-bg-muted transition text-text-muted hover:text-text"
        >
          ✕
        </button>
      </div>

      <div class="p-6">
          <!-- Upload area -->
          <label
            class="
              relative block
              border-2 border-dashed border-border
              rounded-xl overflow-hidden
              cursor-pointer
              bg-bg
              hover:border-accent
              transition-colors
              touch-manipulation
            "
          >
            <input
              :key="inputKey"
              type="file"
              accept="image/*"
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              :disabled="loading"
              @change="onFileChange"
            />
    
            <!-- Empty -->
            <div
              v-if="!preview"
              class="
                h-52
                flex flex-col items-center justify-center
                text-text-muted text-sm gap-3
              "
            >
              <div class="p-4 bg-bg-soft rounded-full">
                <span class="text-3xl">＋</span>
              </div>
              <span class="font-bold tracking-tight">Press to select image</span>
            </div>
    
            <!-- Preview -->
            <img
              v-else
              :src="preview"
              class="w-full max-h-72 object-cover"
            />
    
            <!-- Loader -->
            <div
              v-if="loading"
              class="
                absolute inset-0
                bg-bg-soft/80 backdrop-blur-sm
                flex flex-col items-center justify-center
                text-text text-sm gap-4
              "
            >
              <span class="loader border-accent border-t-transparent"></span>
              <span class="font-extrabold tracking-tighter">PUBLISHING...</span>
            </div>
          </label>
    
          <!-- Caption -->
          <textarea
            v-model="caption"
            rows="3"
            placeholder="Share the story behind your art..."
            :disabled="loading"
            class="
              mt-6 w-full resize-none
              rounded-xl
              bg-bg border border-border
              px-4 py-3
              text-[15px]
              focus:outline-none
              focus:ring-2 focus:ring-accent/20
              disabled:opacity-60
              transition-all
            "
          />
    
          <!-- Error -->
          <p v-if="error" class="mt-3 text-sm text-danger font-bold">
            {{ error }}
          </p>
    
          <!-- Actions -->
          <div class="mt-8 flex gap-3">
            <button
              @click="cleanup(true)"
              :disabled="loading"
              class="flex-1 py-3 rounded-xl font-bold text-sm bg-bg-muted text-text-soft hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
    
            <button
              @click="publish"
              :disabled="!file || loading"
              class="
                flex-2 px-8 py-3
                rounded-xl
                bg-accent text-bg
                text-sm font-bold
                disabled:opacity-40
                shadow-lg shadow-accent/20
                hover:opacity-90 transition
              "
            >
              {{ loading ? "Publishing…" : "Publish Art" }}
            </button>
          </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes modalIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.animate-modalIn {
  animation: modalIn 0.35s ease-out;
}

.loader {
  width: 28px;
  height: 28px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
