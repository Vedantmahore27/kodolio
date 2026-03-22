const Discussion = require("../models/discussion");
const User = require("../models/user");

// Create a new discussion message
const createMessage = async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user._id;

        // Validate message
        if (!message || message.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: "Message cannot be empty"
            });
        }

        // Get user info
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }

        // Create new discussion message
        const newMessage = await Discussion.create({
            author: userId,
            authorName: `${user.firstName} ${user.lastName || ""}`.trim(),
            authorAvatar: user.avatar || null,
            message: message.trim()
        });

        res.status(201).json({
            success: true,
            message: "Message posted successfully",
            data: newMessage
        });

    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

// Get all discussion messages
const getAllMessages = async (req, res) => {
    try {
        const messages = await Discussion.find()
            .populate("author", "firstName lastName avatar")
            .populate("likes", "firstName lastName")
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            success: true,
            data: messages,
            count: messages.length
        });

    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

// Get single message by ID
const getMessageById = async (req, res) => {
    try {
        const { messageId } = req.params;

        const message = await Discussion.findById(messageId)
            .populate("author", "firstName lastName avatar")
            .populate("likes", "firstName lastName");

        if (!message) {
            return res.status(404).json({
                success: false,
                error: "Message not found"
            });
        }

        res.status(200).json({
            success: true,
            data: message
        });

    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

// Update a message
const updateMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { message } = req.body;
        const userId = req.user._id;

        // Validate message
        if (!message || message.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: "Message cannot be empty"
            });
        }

        // Find message
        const currMessage = await Discussion.findById(messageId);
        if (!currMessage) {
            return res.status(404).json({
                success: false,
                error: "Message not found"
            });
        }

        // Check if user is author
        if (currMessage.author.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                error: "You can only update your own messages"
            });
        }

        // Update message
        currMessage.message = message.trim();
        currMessage.updatedAt = Date.now();
        await currMessage.save();

        res.status(200).json({
            success: true,
            message: "Message updated successfully",
            data: currMessage
        });

    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

// Delete a message
const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user._id;

        // Find message
        const message = await Discussion.findById(messageId);
        if (!message) {
            return res.status(404).json({
                success: false,
                error: "Message not found"
            });
        }

        // Check if user is author
        if (message.author.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                error: "You can only delete your own messages"
            });
        }

        // Delete message
        await Discussion.findByIdAndDelete(messageId);

        res.status(200).json({
            success: true,
            message: "Message deleted successfully"
        });

    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

// Like a message
const likeMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user._id;

        const message = await Discussion.findById(messageId);
        if (!message) {
            return res.status(404).json({
                success: false,
                error: "Message not found"
            });
        }

        // Check if already liked
        if (message.likes.includes(userId)) {
            // Remove like
            message.likes = message.likes.filter(id => id.toString() !== userId.toString());
        } else {
            // Add like
            message.likes.push(userId);
        }

        await message.save();

        res.status(200).json({
            success: true,
            message: "Like updated successfully",
            data: message
        });

    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

module.exports = {
    createMessage,
    getAllMessages,
    getMessageById,
    updateMessage,
    deleteMessage,
    likeMessage
};
