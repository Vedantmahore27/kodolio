const mongoose = require("mongoose");
const { Schema } = mongoose;

const discussionSchema = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    authorName: {
        type: String,
        required: true
    },
    authorAvatar: {
        type: String,
        default: null
    },
    message: {
        type: String,
        required: true,
        trim: true,
        minLength: 1,
        maxLength: 1000
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    likes: {
        type: [Schema.Types.ObjectId],
        ref: "user",
        default: []
    }
});

const Discussion = mongoose.model("discussion", discussionSchema);
module.exports = Discussion;
