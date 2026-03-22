const express = require("express");
const {
    createMessage,
    getAllMessages,
    getMessageById,
    updateMessage,
    deleteMessage,
    likeMessage
} = require("../controllers/discussion");
const userMiddleware = require("../middleware/userMiddleware");

const discussionRouter = express.Router();

// Get all discussion messages (public - no auth required)
discussionRouter.get("/", getAllMessages);

// Get single message (public - no auth required)
discussionRouter.get("/:messageId", getMessageById);

// Create new message (requires auth)
discussionRouter.post("/", userMiddleware, createMessage);

// Update message (requires auth)
discussionRouter.patch("/:messageId", userMiddleware, updateMessage);

// Delete message (requires auth)
discussionRouter.delete("/:messageId", userMiddleware, deleteMessage);

// Like/Unlike message (requires auth)
discussionRouter.post("/:messageId/like", userMiddleware, likeMessage);

module.exports = discussionRouter;
