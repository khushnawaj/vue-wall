import { defineStore } from "pinia";
import api from "@/services/api";
import { useAuthStore } from "./authStore";

export const useChatStore = defineStore("chat", {
  state: () => ({
    conversations: [],
    messages: [],
    activeConversation: null,
    loading: false,
    isPartnerTyping: false
  }),

  actions: {
    async fetchConversations() {
      try {
        const res = await api.get("/chat/conversations");
        this.conversations = res.data;
      } catch (err) {
        console.error(err);
      }
    },

    async fetchMessages(conversationId) {
      this.loading = true;
      try {
        const res = await api.get(`/chat/messages/${conversationId}`);
        this.messages = res.data;
      } catch (err) {
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

    async sendMessage(conversationId, text) {
      try {
        const res = await api.post("/chat/send", { conversationId, text });
        // Local logic: we might wait for socket to add it, or add it manually
        // Since we emit to participants including self, we might double add if we add here
        // But for UX, adding locally first is better. socket listener should handle duplicates.
        return res.data;
      } catch (err) {
        console.error(err);
      }
    },

    async startChat(targetUserId) {
      try {
        const res = await api.post("/chat/start", { targetUserId });
        this.activeConversation = res.data;
        return res.data;
      } catch (err) {
        console.error(err);
      }
    },

    async markAsRead(conversationId) {
      try {
        await api.put(`/chat/read/${conversationId}`);
        // Locally update messages
        this.messages.forEach(m => {
            if (!m.isRead && m.sender !== useAuthStore().user?._id) {
                m.isRead = true;
            }
        });
      } catch (err) {
        console.error("Failed to mark read", err);
      }
    },

    markLocalMessagesRead(conversationId) {
        if (this.activeConversation && this.activeConversation._id === conversationId) {
            this.messages.forEach(m => {
                m.isRead = true;
            });
        }
    },

    addMessage(message) {
      // Avoid duplicates
      if (this.messages.some(m => m._id === message._id)) return;
      
      if (this.activeConversation && message.conversation === this.activeConversation._id) {
          this.messages.push(message);
          // If we receive a message, they clearly stopped typing (or sent it)
          this.isPartnerTyping = false; 
      }

      // Update last message in conversations
      const conv = this.conversations.find(c => c._id === message.conversation);
      if (conv) {
          conv.lastMessage = message;
          // Sort conversations by latest
          this.conversations.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      } else {
          // might be a new conversation
          this.fetchConversations();
      }
    },

    setTypingStatus(conversationId, isTyping) {
        if (this.activeConversation && this.activeConversation._id === conversationId) {
            this.isPartnerTyping = isTyping;
        }
    }
  }
});
