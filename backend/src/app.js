import express from "express";
import cors from "cors";
import passport from "passport";
import { configureSocialAuth } from "./config/socialAuth.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import artworkRoutes from "./routes/artwork.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import searchRoutes from "./routes/search.routes.js";


const allowedOrigins = [
  "http://localhost:5173",        // Vite local
  "http://localhost:3000",        // optional
  "https://vue-wall.vercel.app"   // Vercel frontend
];

const app = express();
configureSocialAuth();

/* Middleware */
app.use(cors(
  {
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }
));
app.use(express.json());
app.use(passport.initialize());

/* Health Check */
app.get("/", (req, res) => {
  res.json({ message: "ArtWall API is running 🎨" });
});


/* Routes */
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/artworks", artworkRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/search", searchRoutes);


export default app;
