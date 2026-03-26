const Discussion = require("../models/discussion");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const Redisclient = require("../config/redis");

// Helper to extract user from socket handshake
const getUserFromSocket = async (socket) => {
    try {
        // Extract token from cookies
        const cookies = socket.handshake.headers.cookie;
        if (!cookies) return null;
        
        const tokenMatch = cookies.match(/token=([^;]+)/);
        if (!tokenMatch) return null;
        
        const token = tokenMatch[1];
        
        // Check if token is blocked
        const isBlocked = await Redisclient.exists(`token:${token}`);
        if (isBlocked) return null;
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded._id);
        return user;
    } catch (err) {
        console.error("Socket auth error:", err.message);
        return null;
    }
};

module.exports = (io) => {
    io.on("connection", (socket) => {
        // Join discussion room
        socket.on("join_discussion", async () => {
            socket.join("discussion");
            
            // Send all existing messages to the new user
            try {
                const messages = await Discussion.find()
                    .populate("author", "firstName lastName avatar _id")
                    .populate("likes", "_id")
                    .sort({ createdAt: -1 });
                
                socket.emit("load_messages", messages);
            } catch (err) {
                socket.emit("error", { message: "Failed to load messages" });
            }
        });

        // Post new message
        socket.on("post_message", async (data) => {
            try {
                const user = await getUserFromSocket(socket);
                if (!user) {
                    socket.emit("error", { message: "Unauthorized" });
                    return;
                }

                if (!data.message || data.message.trim().length === 0) {
                    socket.emit("error", { message: "Message cannot be empty" });
                    return;
                }

                const newMessage = await Discussion.create({
                    author: user._id,
                    authorName: `${user.firstName} ${user.lastName || ""}`.trim(),
                    authorAvatar: user.avatar || null,
                    message: data.message.trim()
                });

                const populatedMessage = await newMessage.populate("author", "firstName lastName avatar _id");
                
                // Broadcast new message to all clients
                io.to("discussion").emit("new_message", populatedMessage);
            } catch (err) {
                socket.emit("error", { message: err.message });
            }
        });

        // Update message
        socket.on("update_message", async (data) => {
            try {
                const user = await getUserFromSocket(socket);
                if (!user) {
                    socket.emit("error", { message: "Unauthorized" });
                    return;
                }

                if (!data.messageId || !data.message || data.message.trim().length === 0) {
                    socket.emit("error", { message: "Invalid data" });
                    return;
                }

                const message = await Discussion.findById(data.messageId);
                if (!message) {
                    socket.emit("error", { message: "Message not found" });
                    return;
                }

                if (message.author.toString() !== user._id.toString()) {
                    socket.emit("error", { message: "Unauthorized" });
                    return;
                }

                message.message = data.message.trim();
                await message.save();

                // Broadcast updated message
                io.to("discussion").emit("message_updated", {
                    messageId: message._id,
                    message: message.message,
                    updatedAt: message.updatedAt
                });
            } catch (err) {
                socket.emit("error", { message: err.message });
            }
        });

        // Delete message
        socket.on("delete_message", async (data) => {
            try {
                const user = await getUserFromSocket(socket);
                if (!user) {
                    socket.emit("error", { message: "Unauthorized" });
                    return;
                }

                const message = await Discussion.findById(data.messageId);
                if (!message) {
                    socket.emit("error", { message: "Message not found" });
                    return;
                }

                if (message.author.toString() !== user._id.toString()) {
                    socket.emit("error", { message: "Unauthorized" });
                    return;
                }

                await Discussion.findByIdAndDelete(data.messageId);

                // Broadcast deleted message
                io.to("discussion").emit("message_deleted", { messageId: data.messageId });
            } catch (err) {
                socket.emit("error", { message: err.message });
            }
        });

        // Like/Unlike message
        socket.on("like_message", async (data) => {
            try {
                const user = await getUserFromSocket(socket);
                if (!user) {
                    socket.emit("error", { message: "Unauthorized" });
                    return;
                }

                const message = await Discussion.findById(data.messageId);
                if (!message) {
                    socket.emit("error", { message: "Message not found" });
                    return;
                }

                const userIdString = user._id.toString();
                const isLiked = message.likes.some(id => id.toString() === userIdString);

                if (isLiked) {
                    message.likes = message.likes.filter(id => id.toString() !== userIdString);
                } else {
                    message.likes.push(user._id);
                }

                await message.save();

                // Broadcast like update
                io.to("discussion").emit("message_liked", {
                    messageId: message._id,
                    likes: message.likes
                });
            } catch (err) {
                socket.emit("error", { message: err.message });
            }
        });

        // Disconnect handler
        socket.on("disconnect", () => {
        });
    });
};
