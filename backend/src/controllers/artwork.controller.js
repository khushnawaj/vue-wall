import cloudinary from "../config/cloudinary.js";
import Artwork from "../models/Artwork.model.js";
import Comment from "../models/Comment.model.js";
import User from "../models/User.model.js";
import { sendNotification } from "../config/socket.js";

/* --------------------
   UPLOAD ARTWORK
-------------------- */
export const uploadArtwork = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const { caption } = req.body;
    let taggedUsers = [];

    // Parse @mentions in caption
    if (caption) {
        const mentions = caption.match(/@(\w+)/g);
        if (mentions) {
            const usernames = mentions.map(m => m.slice(1));
            const users = await User.find({ name: { $in: usernames } });
            taggedUsers = users.map(u => u._id);
        }
    }

    // convert buffer → base64
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64Image, {
      folder: "artwall"
    });

    const artwork = await Artwork.create({
      imageUrl: result.secure_url,
      caption: caption || "",
      owner: req.user._id,
      taggedUsers
    });

    // Send mention notifications
    taggedUsers.forEach(uid => {
        if (uid.toString() !== req.user._id.toString()) {
            sendNotification({
                recipient: uid,
                sender: req.user._id,
                type: "mention",
                artwork: artwork._id
            });
        }
    });

    const populatedArtwork = await Artwork.findById(artwork._id).populate("owner", "name avatar");

    res.status(201).json({
      message: "Artwork uploaded",
      artwork: populatedArtwork
    });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    res.status(500).json({
      message: "Artwork upload failed"
    });
  }
};

/* --------------------
   GET SINGLE ARTWORK
-------------------- */
export const getArtworkById = async (req, res) => {
    try {
        const artwork = await Artwork.findById(req.params.id)
            .populate("owner", "name avatar");
        if (!artwork) return res.status(404).json({ message: "Artwork not found" });
        res.json(artwork);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch artwork" });
    }
};

/* --------------------
   GET GLOBAL GALLERY
-------------------- */
export const getAllArtworks = async (req, res) => {
  const artworks = await Artwork.find()
    .populate("owner", "name avatar")
    .populate("taggedUsers", "name avatar")
    .sort({ createdAt: -1 });

  res.json(artworks);
};

/* --------------------
   GET USER ARTWORKS
-------------------- */
export const getMyArtworks = async (req, res) => {
  const artworks = await Artwork.find({ owner: req.user._id })
    .populate("owner", "name avatar")
    .populate("taggedUsers", "name avatar")
    .sort({
      createdAt: -1
    });

  res.json(artworks);
};

export const getUserArtworks = async (req, res) => {
  const artworks = await Artwork.find({ owner: req.params.userId })
    .populate("owner", "name avatar")
    .populate("taggedUsers", "name avatar")
    .sort({
      createdAt: -1
    });

  res.json(artworks);
};

export const getTaggedArtworks = async (req, res) => {
    try {
        const artworks = await Artwork.find({ taggedUsers: req.params.userId })
            .populate("owner", "name avatar")
            .populate("taggedUsers", "name avatar")
            .sort({ createdAt: -1 });
        res.json(artworks);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch tagged artworks" });
    }
}

/* --------------------
   LIKE / UNLIKE
-------------------- */
export const toggleLike = async (req, res) => {
  const artwork = await Artwork.findById(req.params.id);

  if (!artwork) {
    return res.status(404).json({ message: "Artwork not found" });
  }

  const alreadyLiked = artwork.likes.includes(req.user._id);

  if (alreadyLiked) {
    artwork.likes.pull(req.user._id);
  } else {
    artwork.likes.push(req.user._id);
    // Send Notification
    if (artwork.owner.toString() !== req.user._id.toString()) {
        sendNotification({
            recipient: artwork.owner,
            sender: req.user._id,
            type: "like",
            artwork: artwork._id
        });
    }
  }

  await artwork.save();
  res.json({ likes: artwork.likes });
};

export const deleteArtwork = async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);

    if (!artwork) {
      return res.status(404).json({ message: "Artwork not found" });
    }

    if (artwork.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this artwork" });
    }

    await artwork.deleteOne(); // ✅ FIX

    res.json({ message: "Artwork deleted successfully" });
  } catch (error) {
    console.error("DELETE ERROR:", error);
    res.status(500).json({
      message: "Failed to delete artwork"
    });
  }
};



export const updateArtworkCaption = async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) {
        return res.status(404).json({ message: "Artwork not found" });
    }

    if (artwork.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not authorized to update this artwork" });
    }
    artwork.caption = req.body.caption || artwork.caption;
    const updatedArtwork = await artwork.save();
    res.json({
        message: "Artwork caption updated",
        artwork: updatedArtwork
    });
  } catch (error) {
    console.error("UPDATE ERROR:", error);
    res.status(500).json({
        message: "Failed to update artwork caption"
    });
  }
};

/* --------------------
   COMMENTS
-------------------- */
export const addComment = async (req, res) => {
  try {
    const { text, parentComment } = req.body;
    if (!text) return res.status(400).json({ message: "Comment text is required" });

    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) return res.status(404).json({ message: "Artwork not found" });

    const comment = await Comment.create({
        text,
        user: req.user._id,
        artwork: req.params.id,
        parentComment: parentComment || null
    });

    // Increment comment count on artwork
    artwork.commentCount = (artwork.commentCount || 0) + 1;
    await artwork.save();

    // Populate user to return immediate visual feedback
    await comment.populate("user", "name avatar");

    // Send Notification
    if (artwork.owner.toString() !== req.user._id.toString()) {
        sendNotification({
            recipient: artwork.owner,
            sender: req.user._id,
            type: "comment",
            artwork: artwork._id,
            text: text.substring(0, 50)
        });
    }

    res.status(201).json(comment);
  } catch (error) {
    console.error("ADD COMMENT ERROR:", error);
    res.status(500).json({ message: "Failed to add comment" });
  }
};

export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ artwork: req.params.id })
        .populate("user", "name avatar")
        .sort({ createdAt: -1 }); // Newest first
    res.json(comments);
  } catch (error) {
    console.error("GET COMMENTS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch comments" });
  }
};

export const updateComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        if (!comment) return res.status(404).json({ message: "Comment not found" });

        if (comment.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        comment.text = req.body.text || comment.text;
        await comment.save();
        await comment.populate("user", "name avatar");

        res.json(comment);
    } catch (error) {
        res.status(500).json({ message: "Update failed" });
    }
};

export const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        if (!comment) return res.status(404).json({ message: "Comment not found" });

        if (comment.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        const artwork = await Artwork.findById(comment.artwork);
        
        // Also find how many sub-comments (replies) we are deleting
        const repliesCount = await Comment.countDocuments({ parentComment: comment._id });
        
        await Comment.deleteOne({ _id: comment._id });
        // Optional: delete children too, or just keep them orphaned? 
        // Better to delete children to keep count accurate
        await Comment.deleteMany({ parentComment: comment._id });

        if (artwork) {
            artwork.commentCount = Math.max(0, (artwork.commentCount || 0) - (1 + repliesCount));
            await artwork.save();
        }

        res.json({ message: "Comment deleted", deletedCount: 1 + repliesCount });
    } catch (error) {
        res.status(500).json({ message: "Delete failed" });
    }
};

/* --------------------
   GET SAVED ARTWORKS
-------------------- */
export const getSavedArtworks = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
        path: 'savedArtworks',
        populate: { path: 'owner', select: 'name avatar' }
    });
    res.json(user.savedArtworks);
  } catch (error) {
    console.error("GET SAVED ERROR:", error);
    res.status(500).json({ message: "Failed to fetch saved artworks" });
  }
};

/* --------------------
   SAVE / UNSAVE
-------------------- */
export const toggleSaveArt = async (req, res) => {
  try {
    const user = req.user;
    const isSaved = user.savedArtworks.includes(req.params.id);

    if (isSaved) {
      user.savedArtworks.pull(req.params.id);
    } else {
      user.savedArtworks.push(req.params.id);
    }

    await user.save();
    res.json({ savedArtworks: user.savedArtworks });
  } catch (error) {
    console.error("SAVE ERROR:", error);
    res.status(500).json({ message: "Failed to save artwork" });
  }
};
