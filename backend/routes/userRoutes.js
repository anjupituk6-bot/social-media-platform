const express = require("express");
const User = require("../models/user");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// GET ALL USERS
router.get("/", async (req, res) => {
    try {
        const users = await User.find()
            .select("-password")
            .sort({ createdAt: -1 });

        res.json(users);

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch users",
            error: error.message
        });
    }
});

// GET MY PROFILE
router.get("/profile", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select("-password")
            .populate("followers", "name email")
            .populate("following", "name email");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json(user);

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch profile",
            error: error.message
        });
    }
});

// GET USER BY ID
router.get("/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select("-password")
            .populate("followers", "name")
            .populate("following", "name");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json(user);

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch user",
            error: error.message
        });
    }
});

// FOLLOW / UNFOLLOW
router.put("/:id/follow", authMiddleware, async (req, res) => {
    try {
        const targetUser = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user.id);

        if (!targetUser || !currentUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (targetUser._id.toString() === currentUser._id.toString()) {
            return res.status(400).json({
                message: "You cannot follow yourself"
            });
        }

        const isFollowing = currentUser.following.some(
            id => id.toString() === targetUser._id.toString()
        );

        if (isFollowing) {
            currentUser.following.pull(targetUser._id);
            targetUser.followers.pull(currentUser._id);
        } else {
            currentUser.following.push(targetUser._id);
            targetUser.followers.push(currentUser._id);
        }

        await currentUser.save();
        await targetUser.save();

        res.json({
            message: isFollowing
                ? "Unfollowed successfully"
                : "Followed successfully",
            following: !isFollowing,
            followersCount: targetUser.followers.length
        });

    } catch (error) {
        res.status(500).json({
            message: "Follow operation failed",
            error: error.message
        });
    }
});

// UPDATE PROFILE
router.put("/profile/update", authMiddleware, async (req, res) => {
    try {
        const { name, bio } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (name) user.name = name;
        if (bio !== undefined) user.bio = bio;

        await user.save();

        res.json({
            message: "Profile updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                bio: user.bio
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Profile update failed",
            error: error.message
        });
    }
});

module.exports = router;