const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Reaction = require("../models/Reaction");
const mongoose = require("mongoose");


exports.createPost = async (req, res) => {
  try {
    const { content, userId } = req.body;
    if (!content || !userId) return res.status(400).json({ message: "Thiếu content hoặc userId" });

    const newPost = new Post({ content, userId });
    await newPost.save();
    return res.status(201).json({ message: "Tạo post thành công", data: newPost });
  } catch (err) {
    return res.status(500).json({ message: "Lỗi tạo post", error: err.message });
  }
};


exports.getPosts = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .populate("userId", "userName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const results = await Promise.all(
      posts.map(async (post) => {
        const [commentCount, reactionCount, shareCount] = await Promise.all([
          Comment.countDocuments({ postId: post._id }).exec(),
          Reaction.countDocuments({ postId: post._id }).exec(),
          Reaction.countDocuments({ postId: post._id, type: "SHARE" }).exec(),
        ]);

        return {
          ...post,
          commentCount: typeof post.commentCount === "number" ? post.commentCount : commentCount,
          reactionCount: typeof post.reactionCount === "number" ? post.reactionCount : reactionCount,
          shareCount: typeof post.shareCount === "number" ? post.shareCount : shareCount,
        };
      })
    );

    const total = await Post.countDocuments().exec();
    return res.status(200).json({ data: results, page, limit, total });
  } catch (err) {
    return res.status(500).json({ message: "Lỗi lấy posts", error: err.message });
  }
};


exports.getPostById = async (req, res) => {
  try {
    const { postId } = req.params;
    if (!mongoose.isValidObjectId(postId)) return res.status(400).json({ message: "postId không hợp lệ" });

    const post = await Post.findById(postId).populate("userId", "userName").lean();
    if (!post) return res.status(404).json({ message: "Không tìm thấy post" });

    const [commentCount, reactionCount, shareCount] = await Promise.all([
      Comment.countDocuments({ postId }).exec(),
      Reaction.countDocuments({ postId }).exec(),
      Reaction.countDocuments({ postId, type: "SHARE" }).exec(),
    ]);

    return res.status(200).json({
      data: {
        ...post,
        commentCount: typeof post.commentCount === "number" ? post.commentCount : commentCount,
        reactionCount: typeof post.reactionCount === "number" ? post.reactionCount : reactionCount,
        shareCount: typeof post.shareCount === "number" ? post.shareCount : shareCount,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Lỗi lấy post", error: err.message });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    if (!mongoose.isValidObjectId(postId)) return res.status(400).json({ message: "postId không hợp lệ" });
    if (!content) return res.status(400).json({ message: "Thiếu content" });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post không tồn tại" });

    post.content = content;
    await post.save();

    return res.status(200).json({ message: "Cập nhật thành công", data: post });
  } catch (err) {
    return res.status(500).json({ message: "Lỗi cập nhật post", error: err.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    if (!mongoose.isValidObjectId(postId)) return res.status(400).json({ message: "postId không hợp lệ" });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post không tồn tại" });

    const deletedComments = await Comment.deleteMany({ postId }).exec();
    const deletedReactions = await Reaction.deleteMany({ postId }).exec();

    await Post.deleteOne({ _id: postId }).exec();

    return res.status(200).json({
      message: "Xóa post thành công",
      deleted: {
        postId,
        commentsDeleted: deletedComments.deletedCount || 0,
        reactionsDeleted: deletedReactions.deletedCount || 0,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Lỗi xóa post", error: err.message });
  }
};
