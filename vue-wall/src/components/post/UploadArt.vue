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
    error.value = err?.response?.data?.message || "Upload failed. Try again.";
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

  // 🔥 force file input reset (correct way)
  inputKey.value = Date.now();

  if (close) emit("close");
}
</script>

<template>
  <!-- Overlay -->
  <div
    class="
      fixed inset-0 z-50
      bg-black/50
      backdrop-blur-sm
      flex items-end sm:items-center justify-center
      px-2 sm:px-0
    "
    @click.self="cleanup(true)"
  >
    <!-- Modal -->
    <div
      class="
        w-full sm:max-w-lg
        bg-bg-soft
        border border-border
        rounded-t-2xl sm:rounded-2xl
        shadow-2xl
        p-5
        animate-modalIn
      "
    >
      <!-- Header -->
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-sm font-medium text-text">
          Add new artwork
        </h2>
        <button
          @click="cleanup(true)"
          class="text-text-muted hover:text-text transition"
        >
          ✕
        </button>
      </div>

      <!-- Upload area -->
      <label
        class="
          block
          border border-dashed border-border
          rounded-xl
          overflow-hidden
          cursor-pointer
          transition
          hover:border-accent/60
        "
      >
        <input
          :key="inputKey"
          type="file"
          accept="image/*"
          hidden
          @change="onFileChange"
        />

        <div
          v-if="!preview"
          class="
            h-48
            flex flex-col items-center justify-center
            text-text-muted
            text-sm
            gap-2
          "
        >
          <span class="text-2xl">＋</span>
          <span>Select an image</span>
        </div>

        <img
          v-else
          :src="preview"
          alt="Preview"
          class="w-full max-h-64 object-cover"
        />
      </label>

      <!-- Caption -->
      <textarea
        v-model="caption"
        rows="2"
        placeholder="Describe this piece…"
        class="
          mt-4 w-full
          resize-none
          rounded-lg
          bg-bg
          border border-border
          px-3 py-2
          text-sm
          text-text
          focus:outline-none
          focus:ring-2 focus:ring-accent/40
        "
      />

      <!-- Error -->
      <p
        v-if="error"
        class="mt-2 text-sm text-red-500"
      >
        {{ error }}
      </p>

      <!-- Actions -->
      <div class="mt-5 flex justify-end gap-3">
        <button
          @click="cleanup(true)"
          class="
            px-4 py-2
            text-sm
            text-text-soft
            hover:text-text
            transition
          "
        >
          Cancel
        </button>

        <button
          @click="publish"
          :disabled="!file || loading"
          class="
            px-4 py-2
            rounded-lg
            text-sm font-medium
            bg-accent
            text-white
            disabled:opacity-40
            transition
          "
        >
          {{ loading ? "Publishing…" : "Publish" }}
        </button>
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
</style>
