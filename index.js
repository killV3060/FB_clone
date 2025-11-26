const express = require("express");
const app = express();
const Post = require("./models/Post");
const mongoose = require("mongoose");
const Comment = require("./models/Comment");
import dotenv from "dotenv";
dotenv.config();

app.use(express.json());

async function connectDatabase() {
  try {
    await mongoose.connect(
      "mongodb+srv://hqviet3060_db_user:quocviet123@killv3060.cpmbt5n.mongodb.net/fb-clone"
    );
    console.log("Kết nối Database thành công !!!");
  } catch (err) {
    console.log("Lỗi kết nối Database: ", err.message);
  }
}

//  Hàm kết nối Database
connectDatabase();

app.use("/api/users", require("./routes/userRoutes"));

//  BEGIN: POST API
app.get("/api/posts", async (req, res) => {
  try {
    let posts = await Post.find().populate("userId", "userName").lean();

    posts = await Promise.all(
      posts.map(async (post) => {
        const commentCount = await Comment.countDocuments({
          postId: post._id,
        }).exec();
        return { ...post, commentCount };
      })
    );

    res.status(200).json({ data: posts, total: posts.length });
  } catch (err) {
    res.status(500).json({ message: "Loi roi ban oi", error: err.message });
  }
});

app.post("/api/posts", async (req, res) => {
  try {
    const { content, userId } = req.body;
    if (!content || !userId) {
      return res.status(400).json({ message: "Nhập cho đủ vào" });
    }
    const newPost = new Post({
      content: req.body.content,
      userId: req.body.userId,
    });
    await newPost.save();

    return res.status(200).json({ newPost: newPost });
  } catch (err) {
    return res
      .status(400)
      .json({ message: "Loi roi ban oi", error: err.message });
  }
});
//  END: POST API
// Lấy tất cả comment trong 1 bài viết cụ thể
app.get("/api/posts/:postId/comments", async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId }).lean();

    res.status(200).json({ data: comments, total: comments.length });
  } catch (err) {
    res.status(500).json({ message: "Loi roi ban oi", error: err.message });
  }
});

app.post("/api/comments", async (req, res) => {
  try {
    const { content, userId, postId } = req.body;
    if (!content || !userId || !postId) {
      return res.status(400).json({ message: "Nhập cho đủ vào" });
    }
    const newComment = new Comment({
      content: req.body.content,
      userId: req.body.userId,
      postId: req.body.postId,
    });
    await newComment.save();

    const updatedPost = await Post.findOne({ _id: postId });
    updatedPost.commentCount = updatedPost.commentCount + 1;
    await updatedPost.save();

    return res.status(200).json({ newComment: newComment });
  } catch (err) {
    return res
      .status(400)
      .json({ message: "Loi roi ban oi", error: err.message });
  }
});
//  BEGIN: COMMENT API
// END:COMMENT API
app.listen(3000, () => {
  console.log("hehe");
});
