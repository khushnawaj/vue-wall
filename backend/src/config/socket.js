import { Server } from "socket.io";
import Notification from "../models/Notification.model.js";

const userSocketMap = {}; // { userId: socketId }
let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId && userId !== "undefined") {
        userSocketMap[userId] = socket.id;
        console.log(`📡 User Connected: ${userId} (${socket.id})`);
    }

    socket.on("disconnect", () => {
      if (userId) {
        delete userSocketMap[userId];
        console.log(`🔌 User Disconnected: ${userId}`);
      }
    });

    socket.on("typing", ({ conversationId, recipientId }) => {
        const receiverSocketId = userSocketMap[recipientId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("userTyping", { conversationId, senderId: userId });
        }
    });

    socket.on("stopTyping", ({ conversationId, recipientId }) => {
        const receiverSocketId = userSocketMap[recipientId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("userStoppedTyping", { conversationId, senderId: userId });
        }
    });
  });

  return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

export const getReceiverSocketId = (userId) => userSocketMap[userId?.toString()];

// Utility to send notification
export const sendNotification = async ({ recipient, sender, type, artwork, text }) => {
    try {
        const notification = await Notification.create({
            recipient,
            sender,
            type,
            artwork,
            text
        });

        await notification.populate("sender", "name avatar");
        if (artwork) await notification.populate("artwork", "imageUrl");

        const receiverSocketId = getReceiverSocketId(recipient.toString());
        console.log(`📡 Notifying user: ${recipient.toString()} (Socket: ${receiverSocketId || 'offline'})`);
        if (receiverSocketId && io) {
            io.to(receiverSocketId).emit("newNotification", notification);
        }
    } catch (error) {
        console.error("Socket Notification Error:", error);
    }
};
