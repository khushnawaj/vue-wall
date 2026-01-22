import Conversation from "../models/Conversation.model.js";
import Message from "../models/Message.model.js";
import { getIO, getReceiverSocketId } from "../config/socket.js";

/* --------------------
   GET OR CREATE CONVERSATION
-------------------- */
export const startConversation = async (req, res) => {
    try {
        const { targetUserId } = req.body;
        const currentUserId = req.user._id;

        let conversation = await Conversation.findOne({
            participants: { $all: [currentUserId, targetUserId] }
        }).populate("participants", "name avatar");

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [currentUserId, targetUserId]
            });
            await conversation.populate("participants", "name avatar");
        }

        res.json(conversation);
    } catch (error) {
        res.status(500).json({ message: "Failed to start conversation" });
    }
};

/* --------------------
   GET ALL CONVERSATIONS
-------------------- */
export const getConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find({
            participants: req.user._id
        })
        .populate("participants", "name avatar")
        .populate("lastMessage")
        .sort({ updatedAt: -1 });

        res.json(conversations);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch conversations" });
    }
};

/* --------------------
   SEND MESSAGE
-------------------- */
export const sendMessage = async (req, res) => {
    try {
        const { conversationId, text } = req.body;
        const senderId = req.user._id;

        const message = await Message.create({
            conversation: conversationId,
            sender: senderId,
            text
        });

        const conversation = await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: message._id
        }, { new: true }).populate("participants", "_id");

        const io = getIO();
        // Emit to participants
        conversation.participants.forEach(p => {
            const socketId = getReceiverSocketId(p._id.toString());
            if (socketId) {
                io.to(socketId).emit("newMessage", message);
            }
        });

        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ message: "Failed to send message" });
    }
};

/* --------------------
   GET MESSAGES
-------------------- */
export const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const messages = await Message.find({ conversation: conversationId })
            .sort({ createdAt: 1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch messages" });
    }
};
/* --------------------
   MARK MESSAGES AS READ
-------------------- */
export const markMessagesRead = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const currentUserId = req.user._id;

        const result = await Message.updateMany(
            { 
                conversation: conversationId, 
                sender: { $ne: currentUserId }, 
                isRead: false 
            },
            { $set: { isRead: true } }
        );

        if (result.modifiedCount > 0) {
            const io = getIO();
            // We need to notify the OTHER participant that their messages were read
            // Find the config to get participants
            const conversation = await Conversation.findById(conversationId);
            if (conversation) {
                 conversation.participants.forEach(pId => {
                     // Don't notify self
                     if (pId.toString() !== currentUserId.toString()) {
                         const socketId = getReceiverSocketId(pId.toString());
                         if (socketId) {
                             io.to(socketId).emit("messagesRead", { conversationId });
                         }
                     }
                 });
            }
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to mark messages as read" });
    }
};
