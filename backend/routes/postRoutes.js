const express = require("express");
const Post = require("../models/post");
const Comment = require("../models/comment");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// CREATE POST
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { content } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({
                message: "Post content is required"
            });
        }

        const post = await Post.create({
            author: req.user.id,
            content: content.trim()
        });

        const result = await Post.findById(post._id)
            .populate("author", "name email profilePicture");

        res.status(201).json(result);

    } catch (error) {
        res.status(500).json({
            message: "Failed to create post",
            error: error.message
        });
    }
});

// GET ALL POSTS
router.get("/", async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("author", "name email profilePicture")
            .populate("likes", "name")
            .sort({ createdAt: -1 });

        res.json(posts);

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch posts",
            error: error.message
        });
    }
});

// LIKE / UNLIKE
router.put("/:id/like", authMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        const userId = req.user.id;

        const alreadyLiked = post.likes.some(
            id => id.toString() === userId
        );

        if (alreadyLiked) {
            post.likes = post.likes.filter(
                id => id.toString() !== userId
            );
        } else {
            post.likes.push(userId);
        }

        await post.save();

        res.json({
            message: alreadyLiked
                ? "Post unliked"
                : "Post liked",
            likesCount: post.likes.length
        });

    } catch (error) {
        res.status(500).json({
            message: "Like operation failed",
            error: error.message
        });
    }
});

// ADD COMMENT
router.post("/:id/comments", authMiddleware, async (req, res) => {
    try {
        const { content } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({
                message: "Comment is required"
            });
        }

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        const comment = await Comment.create({
            post: post._id,
            author: req.user.id,
            content: content.trim()
        });

        const result = await Comment.findById(comment._id)
            .populate("author", "name");

        res.status(201).json(result);

    } catch (error) {
        res.status(500).json({
            message: "Failed to add comment",
            error: error.message
        });
    }
});

// GET COMMENTS
router.get("/:id/comments", async (req, res) => {
    try {
        const comments = await Comment.find({
            post: req.params.id
        })
            .populate("author", "name")
            .sort({ createdAt: 1 });

        res.json(comments);

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch comments",
            error: error.message
        });
    }
});

module.exports = router;