const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");

router.post("/", postController.createPost);       
router.get("/", postController.getPosts);  
router.get("/:postId", postController.getPostById);
router.put("/:postId", postController.updatePost);   
router.delete("/:postId", postController.deletePost);

module.exports = router;
