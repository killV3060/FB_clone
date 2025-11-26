const mongoose = require("mongoose");
const postSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    commentCount: { type: Number, default: 0 },
    reactionCount: { type: Number, default: 0 },
    shareCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
