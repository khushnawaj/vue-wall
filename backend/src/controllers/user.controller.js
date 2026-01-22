import User from "../models/User.model.js";
import cloudinary from "../config/cloudinary.js";
import { sendNotification } from "../config/socket.js";

/* --------------------
   GET MY PROFILE
-------------------- */
export const getMyProfile = async (req, res) => {
  res.json(req.user);
};

/* --------------------
   UPDATE PROFILE (name, bio, avatar)
-------------------- */
export const updateProfile = async (req, res) => {
  try {
    const { name, bio } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    /* -------- TEXT FIELDS -------- */
    if (name) user.name = name;
    if (bio) user.bio = bio;

    /* -------- AVATAR UPLOAD -------- */
    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString(
          "base64"
        )}`,
        {
          folder: "artwall/avatars",
          public_id: `avatar_${user._id}`,
          overwrite: true,
          resource_type: "image"
        }
      );

      user.avatar = uploadResult.secure_url;
    }

    const updatedUser = await user.save();

    res.json({
      message: "Profile updated",
      user: updatedUser
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* --------------------
   GET PUBLIC USER PROFILE
-------------------- */
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("followers", "name avatar")
      .populate("following", "name avatar");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user profile" });
  }
};

/* --------------------
   TOGGLE FOLLOW / UNFOLLOW
-------------------- */
export const toggleFollow = async (req, res) => {
  try {
    const { id: targetId } = req.params;
    const currentUserId = req.user._id;

    if (targetId === currentUserId.toString()) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const targetUser = await User.findById(targetId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isFollowing = currentUser.following.includes(targetId);

    if (isFollowing) {
      // Unfollow
      currentUser.following.pull(targetId);
      targetUser.followers.pull(currentUserId);
    } else {
      // Follow
      currentUser.following.push(targetId);
      targetUser.followers.push(currentUserId);

      // Send Notification
      sendNotification({
          recipient: targetId,
          sender: currentUserId,
          type: "follow"
      });
    }

    await currentUser.save();
    await targetUser.save();

    res.json({
      message: isFollowing ? "Unfollowed" : "Followed",
      following: currentUser.following,
      followers: targetUser.followers
    });
  } catch (error) {
    console.error("Follow error:", error);
    res.status(500).json({ message: "Follow action failed" });
  }
};
