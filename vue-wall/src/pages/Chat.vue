<template>
  <!-- Main Container -->
  <div class="flex flex-col md:flex-row h-[calc(100vh-64px)] md:h-[calc(100vh-100px)] max-w-7xl mx-auto md:px-4 md:py-4 overflow-hidden">
    
    <!-- 
      SIDEBAR (Conversation List)
    -->
    <div 
      class="w-full md:w-96 bg-bg flex flex-col border-r border-border md:rounded-2xl md:border md:mr-4 shadow-sm overflow-hidden z-20"
      :class="{ 'hidden md:flex': activeConversationId && isMobile, 'flex': !activeConversationId || !isMobile }"
    >
      <!-- Header -->
      <div class="px-5 py-4 border-b border-border bg-bg/95 backdrop-blur z-10 flex justify-between items-center">
        <h1 class="text-2xl font-heading font-extrabold tracking-tight text-text">Messages</h1>
        <div class="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
            <span class="text-xs font-bold">{{ chatStore.conversations.length }}</span>
        </div>
      </div>

      <!-- Search -->
      <div class="px-4 py-2">
        <div class="relative group">
            <Search :size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent transition-colors" />
            <input 
                type="text" 
                placeholder="Search people..." 
                class="w-full bg-bg-muted/50 pl-10 pr-4 py-3 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/20 focus:bg-bg transition-all placeholder:text-text-muted/70 text-text"
            >
        </div>
      </div>

      <!-- List -->
      <div class="flex-1 overflow-y-auto custom-scrollbar px-2 pb-20 md:pb-2 pt-2">
        <div 
          v-for="conv in chatStore.conversations" 
          :key="conv._id"
          @click="selectConversation(conv)"
          class="group flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-200 mb-1 border border-transparent"
          :class="isActive(conv) ? 'bg-accent/10 border-accent/10' : 'hover:bg-bg-muted/60'"
        >
          <!-- Avatar -->
          <div class="relative shrink-0">
             <div class="w-14 h-14 rounded-full overflow-hidden border-2 border-bg-soft shadow-sm bg-bg-soft">
                  <img v-if="getPartner(conv)?.avatar" :src="getPartner(conv).avatar" class="w-full h-full object-cover">
                  <div v-else class="w-full h-full flex items-center justify-center font-bold text-accent text-lg bg-accent/5">
                      {{ getPartner(conv)?.name?.charAt(0) }}
                  </div>
             </div>
             <!-- Online Status -->
             <span class="absolute bottom-1 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-bg rounded-full p-0.5"></span>
          </div>

          <div class="flex-1 min-w-0 py-1">
             <div class="flex justify-between items-center mb-0.5">
                 <h4 
                    class="font-bold text-[16px] truncate"
                    :class="isActive(conv) ? 'text-text' : 'text-text'"
                 >
                    {{ getPartner(conv)?.name }}
                 </h4>
                 <span class="text-[11px] font-bold text-text-muted/80 bg-bg-muted/50 px-1.5 py-0.5 rounded-md">{{ formatTime(conv.updatedAt) }}</span>
             </div>
             <div class="flex items-center gap-1.5">
                 <span v-if="conv.lastMessage?.sender === authStore.user?._id" class="text-text-muted shrink-0">
                    <CheckCheck v-if="conv.lastMessage.isRead" :size="16" class="text-blue-500" />
                    <Check v-else :size="16" />
                 </span>
                 <p 
                    class="text-[14px] truncate leading-snug flex-1"
                    :class="isUnread(conv) ? 'text-text font-bold' : 'text-text-soft font-medium'"
                 >
                    {{ conv.lastMessage?.text || 'Say hi! 👋' }}
                 </p>
                 <span v-if="isUnread(conv)" class="w-5 h-5 bg-accent text-white text-[10px] flex items-center justify-center rounded-full font-bold shadow-sm shadow-accent/30">1</span>
             </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 
      MAIN CHAT AREA 
    -->
    <div 
      class="flex-1 overflow-hidden flex flex-col bg-bg-soft md:border md:border-border md:rounded-2xl shadow-sm relative z-10"
      :class="{ 'flex fixed inset-0 z-50 md:static': activeConversationId && isMobile, 'hidden md:flex': !activeConversationId && isMobile }"
    >
        <template v-if="chatStore.activeConversation">
            
            <!-- Doodle Background -->
            <div class="absolute inset-0 z-0 opacity-[0.06] dark:opacity-[0.08] pointer-events-none chat-bg-pattern dark:invert"></div>

            <!-- Header -->
            <div class="h-[68px] px-2 md:px-4 flex items-center justify-between bg-bg border-b border-border z-20 shadow-sm relative">
                <div class="flex items-center gap-1">
                    <button 
                        @click="closeChat"
                        class="md:hidden p-2 rounded-full hover:bg-bg-muted text-text-soft transition"
                    >
                        <ChevronLeft :size="26" stroke-width="2.5" />
                    </button>
                    
                    <div 
                        class="flex items-center gap-3 cursor-pointer p-1.5 rounded-lg hover:bg-bg-muted/50 transition"
                        @click="router.push(`/profile/${activePartner?._id}`)"
                    >
                        <div class="w-10 h-10 rounded-full overflow-hidden border border-border shadow-sm">
                            <img v-if="activePartner?.avatar" :src="activePartner.avatar" class="w-full h-full object-cover">
                            <div v-else class="w-full h-full flex items-center justify-center font-bold text-lg text-accent bg-accent/5">
                                {{ activePartner?.name?.charAt(0) }}
                            </div>
                        </div>
                        <div class="flex flex-col">
                            <h3 class="font-bold text-base leading-none text-text mb-0.5">{{ activePartner?.name }}</h3>
                            <span class="text-[11px] font-bold text-text-muted/80 flex items-center gap-1">
                                tap for info
                            </span>
                        </div>
                    </div>
                </div>
                
                <div class="flex items-center gap-1">
                    <button class="p-2.5 rounded-full hover:bg-bg-muted text-accent transition">
                        <Phone :size="22" stroke-width="1.5" /> <!-- Filled Phone -->
                    </button>
                    <button class="p-2.5 rounded-full hover:bg-bg-muted text-text-soft transition">
                        <MoreVertical :size="22" />
                    </button>
                </div>
            </div>

            <!-- Messages List -->
            <div 
                ref="msgContainer" 
                class="flex-1 overflow-y-auto px-3 py-4 md:px-8 space-y-3 z-10 relative custom-scrollbar scroll-smooth"
            >
                <div v-if="chatStore.loading" class="flex justify-center py-6">
                    <div class="px-4 py-1 bg-bg-muted/70 backdrop-blur rounded-full text-xs font-bold text-text-muted shadow-sm border border-border">Loading messages...</div>
                </div>
                
                <!-- Date Pill Mockup -->
                <div class="flex justify-center my-4 sticky top-0 z-10 opacity-80 hover:opacity-100 transition-opacity">
                    <span class="px-3 py-1 bg-bg-muted border border-border text-text-soft text-[11px] font-bold rounded-full shadow-sm">Today</span>
                </div>

                <div 
                    v-for="(msg, index) in chatStore.messages" 
                    :key="msg._id"
                    class="group flex w-full"
                    :class="isMe(msg) ? 'justify-end' : 'justify-start'"
                >
                    <div 
                        class="max-w-[85%] md:max-w-[60%] flex flex-col relative"
                        :class="isMe(msg) ? 'items-end' : 'items-start'"
                    >
                         <!-- Message Bubble -->
                         <div 
                            class="px-4 py-2 text-[15.5px] shadow-sm relative break-words leading-snug"
                            :class="[
                                isMe(msg) 
                                    ? 'bg-gradient-to-br from-[#00b2ff] to-[#006aff] text-white rounded-2xl rounded-tr-none bubble-sent' 
                                    : 'bg-bg border border-border/60 text-text rounded-2xl rounded-tl-none bubble-received'
                            ]"
                         >
                            {{ msg.text }}
                            
                            <!-- Timestamp & Status -->
                            <div 
                                class="float-right ml-3 mt-1.5 flex items-center gap-0.5 select-none"
                                :class="isMe(msg) ? 'text-blue-100' : 'text-text-muted'"
                            >
                                <span class="text-[10px] font-medium opacity-90">{{ formatMessageTime(msg.createdAt) }}</span>
                                <span v-if="isMe(msg)" class="flex items-center">
                                    <!-- Double Tick (Read) -->
                                    <CheckCheck v-if="msg.isRead" :size="15" class="text-sky-200 stroke-[2.5]" />
                                    <!-- Single Tick (Sent/Unread) -->
                                    <Check v-else :size="15" class="opacity-70" />
                                </span>
                            </div>
                         </div>
                    </div>
                </div>
                <div ref="bottomRef" class="h-2"></div>
            </div>

            <!-- Input Area -->
            <div class="bg-bg border-t border-border p-3 md:p-4 z-20 relative">
                <div class="flex items-end gap-2">
                    <button class="p-3 text-text-muted hover:text-accent transition-colors rounded-full hover:bg-bg-muted">
                        <Plus :size="24" />
                    </button>
                    
                    <div class="flex-1 bg-bg-muted/40 border border-transparent focus-within:border-accent/30 focus-within:bg-bg rounded-[24px] flex items-center px-4 py-1 transition-all">
                        <textarea 
                            v-model="newMessage"
                            rows="1"
                            placeholder="Type a message..."
                            class="flex-1 bg-transparent max-h-32 text-[16px] py-3 focus:outline-none text-text placeholder:text-text-muted/60 resize-none custom-scrollbar"
                            @keydown.enter.prevent="handleSend"
                            @focus="markReadIfActive"
                        ></textarea>
                    </div>

                    <button 
                         @click="handleSend"
                         :disabled="!newMessage.trim()"
                         class="w-12 h-12 flex items-center justify-center bg-accent text-white rounded-full hover:opacity-90 disabled:opacity-50 disabled:grayscale transition-all shadow-lg shadow-accent/20 active:scale-95"
                    >
                        <Send :size="22" stroke-width="2" class="ml-0.5" />
                    </button>
                </div>
            </div>

        </template>

        <!-- Empty State -->
        <div v-else class="h-full flex flex-col items-center justify-center p-10 text-center relative z-20">
             <!-- Doodle Background visible here too -->
             <div class="absolute inset-0 z-0 opacity-[0.06] dark:opacity-[0.03] pointer-events-none chat-bg-pattern"></div>
             
             <div class="relative z-10 flex flex-col items-center">
                <div class="w-40 h-40 mb-6 relative">
                    <!-- Fun geometric composition -->
                    <div class="absolute inset-0 bg-blue-500/10 rounded-full animate-pulse"></div>
                    <div class="absolute inset-4 bg-accent/20 rounded-full blur-xl"></div>
                    <MessageSquare :size="80" class="text-accent relative z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <h2 class="text-3xl font-heading font-extrabold text-text mb-3">Welcome to Hiking</h2>
                <p class="text-text-soft font-medium max-w-xs text-lg">
                    Pick a person to verify the <span class="text-accent font-bold">double ticks</span>!
                </p>
             </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick, onUnmounted } from "vue";
import { useChatStore } from "@/store/chatStore";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "vue-router";
import { 
    Send, 
    MoreVertical, 
    MessageSquare, 
    ChevronLeft, 
    Check, 
    CheckCheck, 
    Search,
    Phone,
    Plus
} from "lucide-vue-next";

const chatStore = useChatStore();
const authStore = useAuthStore();
const router = useRouter();

const msgContainer = ref(null);
const bottomRef = ref(null);
const newMessage = ref("");

// Responsive State
const windowWidth = ref(window.innerWidth);
const isMobile = computed(() => windowWidth.value < 768);

const activeConversationId = computed(() => chatStore.activeConversation?._id);

const activePartner = computed(() => {
    if (!chatStore.activeConversation) return null;
    return getPartner(chatStore.activeConversation);
});

// Update window width
function updateWidth() {
    windowWidth.value = window.innerWidth;
}
onMounted(() => {
    window.addEventListener('resize', updateWidth);
    window.addEventListener('focus', handleWindowFocus);
    chatStore.fetchConversations();
});
onUnmounted(() => {
    window.removeEventListener('resize', updateWidth);
    window.removeEventListener('focus', handleWindowFocus);
});

function handleWindowFocus() {
    if (chatStore.activeConversation) {
        markReadIfActive();
    }
}

function getPartner(conv) {
    if (!conv || !conv.participants) return null;
    return conv.participants.find(p => p._id !== authStore.user?._id) || conv.participants[0];
}

function selectConversation(conv) {
    chatStore.activeConversation = conv;
    chatStore.fetchMessages(conv._id);
    chatStore.markAsRead(conv._id);
}

function closeChat() {
    chatStore.activeConversation = null;
}

function isMe(msg) {
    return msg.sender === authStore.user?._id;
}

function isUnread(conv) {
    if (!conv.lastMessage) return false;
    return !conv.lastMessage.isRead && conv.lastMessage.sender !== authStore.user?._id;
}

function isActive(conv) {
    return chatStore.activeConversation?._id === conv._id;
}

function markReadIfActive() {
    if (chatStore.activeConversation) {
        chatStore.markAsRead(chatStore.activeConversation._id);
    }
}

async function handleSend() {
    if (!newMessage.value.trim()) return;
    const text = newMessage.value;
    newMessage.value = ""; // Clear immediately for better UX
    await chatStore.sendMessage(chatStore.activeConversation._id, text);
    scrollToBottom();
}

// Formatters
function formatTime(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function formatMessageTime(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

// Watching
watch(() => chatStore.messages.length, scrollToBottom);
watch(() => chatStore.activeConversation, () => {
    setTimeout(scrollToBottom, 50); // Small delay for layout
});

// Incoming message watcher for read receipts
watch(() => chatStore.messages, (newMsgs) => {
    if (newMsgs.length > 0) {
        const lastMsg = newMsgs[newMsgs.length - 1];
        if (!isMe(lastMsg) && !lastMsg.isRead && document.hasFocus()) {
             markReadIfActive();
        }
    }
}, { deep: true });

function scrollToBottom() {
    nextTick(() => {
        bottomRef.value?.scrollIntoView({ behavior: "smooth" });
    });
}
</script>

<style scoped>
.loader-sm {
  width: 24px;
  height: 24px;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }

/* Hike-like Pattern Background (Subtle Geometric) */
.chat-bg-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

/* Bubble Tails */
.bubble-sent {
    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}
.bubble-received {
    box-shadow: 0 1px 2px rgba(0,0,0,0.06);
}
</style>
