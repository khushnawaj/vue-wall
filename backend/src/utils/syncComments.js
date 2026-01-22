import Artwork from "../models/Artwork.model.js";
import Comment from "../models/Comment.model.js";

const syncCommentCounts = async () => {
    try {
        console.log("🔍 Syncing comment counts...");
        const artworks = await Artwork.find();
        
        for (const artwork of artworks) {
            const count = await Comment.countDocuments({ artwork: artwork._id });
            artwork.commentCount = count;
            await artwork.save();
        }
        
        console.log("✅ Comment counts synced successfully!");
    } catch (error) {
        console.error("❌ Failed to sync comment counts:", error);
    }
};

export default syncCommentCounts;
