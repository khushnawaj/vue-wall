import Artwork from "../models/Artwork.model.js";
import User from "../models/User.model.js";

export const searchAll = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json({ artworks: [], users: [] });

        const regex = new RegExp(q, "i");

        const [artworks, users] = await Promise.all([
            Artwork.find({ caption: regex }).populate("owner", "name avatar").limit(20),
            User.find({ name: regex }).select("name avatar bio").limit(10)
        ]);

        res.json({ artworks, users });
    } catch (error) {
        res.status(500).json({ message: "Search failed" });
    }
};
