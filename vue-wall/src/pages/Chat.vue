<template>
  <div class="w-full max-w-6xl mx-auto h-[calc(100vh-140px)] md:h-[calc(100vh-120px)] flex bg-bg-soft/50 rounded-none md:rounded-3xl border-x md:border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-500">
    
    <!-- Sidebar: Conversations -->
    <div 
        class="w-full md:w-80 border-r border-border flex flex-col bg-bg"
        :class="{ 'hidden md:flex': isChatOpenOnMobile }"
    >
        <div class="p-6 border-b border-border">
            <h1 class="text-xl font-heading font-extrabold tracking-tighter">Messages</h1>
        </div>

        <div class="flex-1 overflow-y-auto custom-scrollbar">
            <div 
                v-for="conv in chatStore.conversations" 
                :key="conv._id"
                @click="selectConversation(conv)"
                class="flex items-center gap-4 p-4 cursor-pointer transition hover:bg-bg-muted"
                :class="{ 'bg-accent/5 border-l-4 border-accent': chatStore.activeConversation?._id === conv._id }"
            >
                <!-- Avatar -->
                <div class="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-border bg-bg-soft">
                    <img v-if="getPartner(conv)?.avatar" :src="getPartner(conv).avatar" class="w-full h-full object-cover">
                    <div v-else class="w-full h-full flex items-center justify-center font-bold text-accent">
                        {{ getPartner(conv)?.name?.charAt(0) }}
                    </div>
                </div>

                <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-baseline mb-0.5">
                        <h4 class="text-sm font-bold text-text truncate">{{ getPartner(conv)?.name }}</h4>
                        <span class="text-[10px] text-text-muted uppercase font-bold">{{ conv.updatedAt ? 'Today' : '' }}</span>
                    </div>
                    <p class="text-[13px] text-text-soft truncate font-medium">
                        {{ conv.lastMessage?.text || 'No messages yet' }}
                    </p>
                </div>
            </div>

            <div v-if="chatStore.conversations.length === 0" class="p-8 text-center">
                <p class="text-sm text-text-muted italic">No conversations yet.</p>
            </div>
        </div>
    </div>

    <!-- Main Chat Window -->
    <div 
        v-if="chatStore.activeConversation" 
        class="flex-1 flex-col bg-bg/50 backdrop-blur-sm"
        :class="isChatOpenOnMobile ? 'flex' : 'hidden md:flex'"
    >
        <!-- Chat Header -->
        <div class="px-6 py-4 border-b border-border bg-bg/80 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <button 
                    @click="isChatOpenOnMobile = false"
                    class="md:hidden p-2 -ml-2 text-text-soft hover:text-text transition"
                >
                    <ChevronLeft :size="20" />
                </button>
                <div class="w-10 h-10 rounded-full overflow-hidden border border-border">
                    <img v-if="activePartner?.avatar" :src="activePartner.avatar" class="w-full h-full object-cover">
                    <div v-else class="w-full h-full flex items-center justify-center font-bold text-lg text-accent">
                        {{ activePartner?.name?.charAt(0) }}
                    </div>
                </div>
                <div>
                    <h3 class="font-bold text-[15px] leading-none mb-1">{{ activePartner?.name }}</h3>
                    <span class="text-[10px] text-success font-bold uppercase tracking-widest">Online</span>
                </div>
            </div>
            <button class="p-2 text-text-soft hover:text-text transition">
                <MoreVertical :size="20" />
            </button>
        </div>

        <!-- Messages Area -->
        <div ref="msgContainer" class="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            <div 
                v-for="msg in chatStore.messages" 
                :key="msg._id"
                class="flex"
                :class="msg.sender === authStore.user?._id ? 'justify-end' : 'justify-start'"
            >
                <div 
                    class="max-w-[70%] px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed shadow-sm"
                    :class="msg.sender === authStore.user?._id 
                        ? 'bg-accent text-bg font-medium rounded-tr-none' 
                        : 'bg-bg border border-border text-text font-medium rounded-tl-none'"
                >
                    {{ msg.text }}
                </div>
            </div>
            <div v-if="chatStore.loading" class="flex justify-center py-4">
                <div class="loader-sm"></div>
            </div>
        </div>

        <!-- Message Input -->
        <div class="p-6 bg-bg/80 border-t border-border">
            <div class="relative flex items-center gap-3">
                <input 
                    v-model="newMessage"
                    type="text" 
                    placeholder="Type a message..." 
                    class="flex-1 bg-bg border border-border px-4 py-3 pr-12 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all font-medium"
                    @keyup.enter="handleSend"
                />
                <button 
                    @click="handleSend"
                    :disabled="!newMessage.trim()"
                    class="p-3 bg-accent text-bg rounded-xl hover:opacity-90 transition disabled:opacity-50 shadow-lg shadow-accent/20"
                >
                    <Send :size="18" />
                </button>
            </div>
        </div>
    </div>

    <!-- Empty State -->
    <div v-else class="hidden md:flex flex-1 flex-col items-center justify-center bg-bg/20">
        <div class="w-20 h-20 rounded-full bg-bg-muted flex items-center justify-center text-text-muted mb-4 opacity-30">
            <MessageSquare :size="40" />
        </div>
        <h2 class="text-2xl font-heading font-bold text-text mb-1">Your Inbox</h2>
        <p class="text-text-soft text-sm">Select a conversation to start chatting.</p>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from "vue";
import { useChatStore } from "@/store/chatStore";
import { useAuthStore } from "@/store/authStore";
import { Send, MoreVertical, MessageSquare, ChevronLeft } from "lucide-vue-next";

const chatStore = useChatStore();
const authStore = useAuthStore();
const msgContainer = ref(null);
const newMessage = ref("");

onMounted(() => {
    chatStore.fetchConversations();
});

const activePartner = computed(() => {
    if (!chatStore.activeConversation) return null;
    return getPartner(chatStore.activeConversation);
});

function getPartner(conv) {
    return conv.participants.find(p => p._id !== authStore.user?._id);
}

const isChatOpenOnMobile = ref(false);

function selectConversation(conv) {
    chatStore.activeConversation = conv;
    chatStore.fetchMessages(conv._id);
    isChatOpenOnMobile.value = true;
}

async function handleSend() {
    if (!newMessage.value.trim()) return;
    const text = newMessage.value;
    newMessage.value = "";
    
    await chatStore.sendMessage(chatStore.activeConversation._id, text);
    // Socket should handle adding it, but we scroll down
}

watch(() => chatStore.messages.length, () => {
    scrollToBottom();
});

function scrollToBottom() {
    nextTick(() => {
        if (msgContainer.value) {
            msgContainer.value.scrollTop = msgContainer.value.scrollHeight;
        }
    });
}

onMounted(scrollToBottom);
</script>

<style scoped>
.loader-sm {
  width: 16px;
  height: 16px;
  border: 2px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 10px;
}
</style>
