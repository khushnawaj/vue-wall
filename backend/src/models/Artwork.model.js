import mongoose from "mongoose";

const artworkSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: true
    },

    caption: {
      type: String,
      trim: true
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    taggedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    commentCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

const Artwork = mongoose.model("Artwork", artworkSchema);
export default Artwork;
