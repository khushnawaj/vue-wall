import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useToastStore = defineStore('toast', () => {
    const toasts = ref([]);

    function success(message, duration = 3000) {
        addToast(message, 'success', duration);
    }

    function error(message, duration = 4000) {
        addToast(message, 'error', duration);
    }

    function info(message, duration = 3000) {
        addToast(message, 'info', duration);
    }

    function addToast(message, type, duration) {
        const id = Date.now();
        toasts.value.push({ id, message, type });
        setTimeout(() => {
            removeToast(id);
        }, duration);
    }

    function removeToast(id) {
        toasts.value = toasts.value.filter(t => t.id !== id);
    }

    return { toasts, success, error, info, removeToast };
});
