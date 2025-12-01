const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    commentCount: { type: Number, default: 0 },
    reactionCount: { type: Number, default: 0 }, 
    shareCount: { type: Number, default: 0 }, 
  },
  { timestamps: true }
);

if (!postSchema.options.toJSON) postSchema.options.toJSON = {};
postSchema.options.toJSON.transform = function (doc, ret) {
  ret.id = ret._id;
  delete ret._id;
  delete ret.__v;
  return ret;
};

postSchema.statics.recalcCounts = async function (postId) {
  const Post = this;
  const Comment = mongoose.model("Comment");
  const Reaction = mongoose.model("Reaction");

  if (!postId) {
    const posts = await Post.find().lean();
    const results = [];
    for (const p of posts) {
      const commentCount = await Comment.countDocuments({ postId: p._id }).exec();
      const reactionCount = await Reaction.countDocuments({ postId: p._id }).exec();
      const shareCount = await Reaction.countDocuments({ postId: p._id, type: "SHARE" }).exec();

      await Post.updateOne({ _id: p._id }, { $set: { commentCount, reactionCount, shareCount } }).exec();
      results.push({ postId: p._id, commentCount, reactionCount, shareCount });
    }
    return results;
  } else {
    const [commentCount, reactionCount, shareCount] = await Promise.all([
      Comment.countDocuments({ postId }).exec(),
      Reaction.countDocuments({ postId }).exec(),
      Reaction.countDocuments({ postId, type: "SHARE" }).exec(),
    ]);
    await Post.updateOne({ _id: postId }, { $set: { commentCount, reactionCount, shareCount } }).exec();
    return { postId, commentCount, reactionCount, shareCount };
  }
};

module.exports = mongoose.model("Post", postSchema);
