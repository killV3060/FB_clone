const Post = require('../models/Post')

exports.getAll = async (req , res) => {
    try {
        const posts = await Post.find();
        res.status(200).json(posts)
    } catch (err) {
        res.status(500).json({message: "Loi roi ban oi", error: err.message})
    }
}

exports.createPost