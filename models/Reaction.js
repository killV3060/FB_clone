const mongoose = require("mongoose");

const ReactionEnum = {
  LIKE: "LIKE",
  HAHA: "HAHA",
  SAD: "SAD",
  WOW: "WOW",
  FAVORITE: "FAVORITE",
  ANGRY: "ANGRY",
  SHARE: "SHARE", 
};

const reactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: Object.values(ReactionEnum),
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
  },
  { timestamps: true }
);

reactionSchema.statics.ReactionEnum = ReactionEnum;

module.exports = mongoose.model("Reaction", reactionSchema);
