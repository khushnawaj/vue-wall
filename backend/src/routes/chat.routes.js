import express from "express";
import protect from "../middlewares/auth.middleware.js";
import { 
    startConversation, 
    getConversations, 
    sendMessage, 
    getMessages,
    markMessagesRead
} from "../controllers/chat.controller.js";

const router = express.Router();

router.post("/start", protect, startConversation);
router.get("/conversations", protect, getConversations);
router.post("/send", protect, sendMessage);
router.get("/messages/:conversationId", protect, getMessages);
router.put("/read/:conversationId", protect, markMessagesRead);

export default router;
