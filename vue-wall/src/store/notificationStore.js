import { defineStore } from "pinia";
import api from "@/services/api";

export const useNotificationStore = defineStore("notification", {
  state: () => ({
    notifications: [],
    loading: false
  }),

  getters: {
    unreadCount: (state) => state.notifications.filter((n) => !n.isRead).length
  },

  actions: {
    async fetchNotifications() {
      this.loading = true;
      try {
        const res = await api.get("/notifications");
        this.notifications = res.data;
      } catch (err) {
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

    async markAllAsRead() {
      try {
        await api.put("/notifications/read");
        this.notifications.forEach((n) => (n.isRead = true));
      } catch (err) {
        console.error(err);
      }
    },

    addNotification(notification) {
      this.notifications.unshift(notification);
    }
  }
});
