const mongoose = require("mongoose");

const ReactionEnum = {
  LIKE: "LIKE",
  HAHA: "HAHA",
  SAD: "SAD",
  WOW: "WOW",
  FAVORITE: "FAVORITE",
  ANGRY: "ANGRY",
};
const reactionSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ReactionEnum },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reaction", reactionSchema);
