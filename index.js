const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();

const Post = require("./models/Post");
const Comment = require("./models/Comment");
const Reaction = require("./models/Reaction");
const postRouter = require("./routes/postRoutes");
const userRouter = require("./routes/userRoutes");

app.use(express.json());

async function connectDatabase() {
  const uri =
    process.env.MONGO_URI ||
    "mongodb+srv://hqviet3060_db_user:quocviet123@killv3060.cpmbt5n.mongodb.net/fb-clone";

  try {
    await mongoose.connect(uri);
    console.log("Kết nối Database thành công !!!");
  } catch (err) {
    console.log("Lỗi kết nối Database:", err.message);
    process.exit(1); 
  }
}
connectDatabase();

app.use("/api/posts", postRouter); 
app.use("/api/users", userRouter);

app.get("/api/posts/:postId/comments", async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId }).lean();
    res.status(200).json({ data: comments, total: comments.length });
  } catch (err) {
    res.status(500).json({ message: "Lỗi rồi bạn ơi", error: err.message });
  }
});

app.post("/api/comments", async (req, res) => {
  try {
    const { content, userId, postId } = req.body;
    if (!content || !userId || !postId) {
      return res.status(400).json({ message: "Nhập cho đủ vào" });
    }
    const newComment = new Comment({ content, userId, postId });
    await newComment.save();

    await Post.updateOne({ _id: postId }, { $inc: { commentCount: 1 } }).exec();

    return res.status(201).json({ newComment });
  } catch (err) {
    return res.status(400).json({ message: "Lỗi rồi bạn ơi", error: err.message });
  }
});

async function ensurePostCounts() {
  try {
    const posts = await Post.find().lean();
    const updated = [];

    await Promise.all(
      posts.map(async (post) => {
        const [commentCount, shareCount] = await Promise.all([
          Comment.countDocuments({ postId: post._id }).exec(),
          Reaction.countDocuments({ postId: post._id, type: "SHARE" }).exec(),
        ]);

        const updates = {};
        if (post.commentCount === undefined || post.commentCount === null) {
          updates.commentCount = commentCount;
        }
        if (post.shareCount === undefined || post.shareCount === null) {
          updates.shareCount = shareCount;
        }

        if (Object.keys(updates).length > 0) {
          await Post.updateOne({ _id: post._id }, { $set: updates }).exec();
          updated.push({ postId: post._id, ...updates });
        }
      })
    );

    return { ok: true, updatedCount: updated.length, updated };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

app.post("/api/posts/repair-counts", async (req, res) => {
  try {
    const result = await ensurePostCounts();
    if (!result.ok) {
      return res.status(500).json({ message: "Repair failed", error: result.error });
    }
    return res.status(200).json({ message: "Repair finished", updatedCount: result.updatedCount, details: result.updated });
  } catch (err) {
    return res.status(500).json({ message: "Lỗi khi repair", error: err.message });
  }
});

app.post("/api/posts/:postId/share", async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "Thiếu userId" });

    const newReaction = new Reaction({ userId, postId, type: "SHARE" });
    await newReaction.save();

    await Post.updateOne({ _id: postId }, { $inc: { shareCount: 1, reactionCount: 1 } }).exec();

    return res.status(201).json({ message: "Đã share bài viết", reaction: newReaction });
  } catch (err) {
    return res.status(500).json({ message: "Lỗi khi share", error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Thanh niên đẹp chai trên ${PORT}`);
});
