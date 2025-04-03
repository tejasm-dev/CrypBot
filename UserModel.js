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
    username: {
        type: String,
        required: true
    },
    joined: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("users", UserSchema);