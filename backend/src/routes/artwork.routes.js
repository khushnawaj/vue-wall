import express from "express";
import protect from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";
import {
  uploadArtwork,
  getAllArtworks,
  getMyArtworks,
  toggleLike,
  deleteArtwork,
  updateArtworkCaption,
  addComment,
  getComments,
  toggleSaveArt,
  getSavedArtworks,
  getUserArtworks,
  updateComment,
  deleteComment,
  getTaggedArtworks,
  getArtworkById
} from "../controllers/artwork.controller.js";

const router = express.Router();

router.get("/", getAllArtworks);
router.get("/me", protect, getMyArtworks);
router.get("/user/:userId", getUserArtworks);
router.get("/tagged/:userId", getTaggedArtworks);
router.get("/:id", getArtworkById);
router.delete("/:id", protect, deleteArtwork);
router.put("/:id", protect, updateArtworkCaption);

router.post(
  "/",
  protect,
  upload.single("image"),
  uploadArtwork
);

router.post("/:id/like", protect, toggleLike);

router.post("/:id/comments", protect, addComment);
router.get("/:id/comments", getComments); 
router.put("/comments/:commentId", protect, updateComment);
router.delete("/comments/:commentId", protect, deleteComment);

router.get("/saved", protect, getSavedArtworks);
router.post("/:id/save", protect, toggleSaveArt);

export default router;
