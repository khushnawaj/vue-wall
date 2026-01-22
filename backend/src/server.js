import dotenv from "dotenv";
import http from "http";
import app from "./app.js";
import connectDB from "./config/db.js";
import syncCommentCounts from "./utils/syncComments.js";
import { initSocket } from "./config/socket.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
initSocket(server);

connectDB().then(() => {
    syncCommentCounts();
});

server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
