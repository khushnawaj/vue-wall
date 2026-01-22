import express from "express";
import protect from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";
import {
  getMyProfile,
  updateProfile,
  getUserProfile,
  toggleFollow
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/me", protect, getMyProfile);
router.put("/me", protect, upload.single("avatar"), updateProfile);
router.get("/:id", getUserProfile);
router.post("/:id/follow", protect, toggleFollow);

export default router;
