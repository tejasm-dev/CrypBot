// User Schema Model for MongoDB using Mongoose
// This schema defines the structure of the user document in the database

const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    telegramID: {  // Unique identifier for the user in Telegram
        type: Number,
        unique: true,
        required: true
    },
    firstname: {
        type: String,
        required: true
    },
    joined: {
        type: Date,
        required: true
    },
    lastMessage: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.model("users", UserSchema);