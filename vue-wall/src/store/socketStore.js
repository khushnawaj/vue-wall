import { io } from "socket.io-client";
import { useAuthStore } from "./authStore";
import { useNotificationStore } from "./notificationStore";
import { useChatStore } from "./chatStore";
import { useToastStore } from "./toastStore";

const SOCKET_URL = "http://localhost:5000";

let socket = null;

export const useSocket = () => {
    const authStore = useAuthStore();
    const notificationStore = useNotificationStore();
    const chatStore = useChatStore();
    const toastStore = useToastStore();

    const connect = () => {
        if (socket || !authStore.user) return;

        const userId = authStore.user._id || authStore.user.id;
        console.log("🔌 Attempting to connect to socket with userId:", userId);

        socket = io(SOCKET_URL, {
            query: { userId }
        });

        socket.on("connect", () => {
            console.log("✅ Socket connected:", socket.id);
        });

        socket.on("newNotification", (notification) => {
            console.log("🔔 New Notification received:", notification);
            notificationStore.addNotification(notification);
            toastStore.info(`New ${notification.type} from ${notification.sender.name}`);
        });

        socket.on("newMessage", (message) => {
            chatStore.addMessage(message);
            // Optional: toast if not in chat
            if (window.location.pathname !== '/chat') {
                toastStore.info(`New message: ${message.text.substring(0, 20)}...`);
            }
        });

        console.log("🔌 Connected to Socket.io");
    };

    const disconnect = () => {
        if (socket) {
            socket.disconnect();
            socket = null;
            console.log("🔌 Disconnected from Socket.io");
        }
    };

    return { connect, disconnect, socket };
};
