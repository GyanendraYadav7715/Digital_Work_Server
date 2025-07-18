const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({

    username: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    user_role: {
        type: String,
        required: true
    },
    balance: {
        type: Number,
        default: 0
    },
    redirect: {
        type: String,
        default: "/superadmin",
    },
    location: {
        lat: { type: Number, default: 0 },
        lng: { type: Number, default: 0 },
    },

})

module.exports = mongoose.model("admin", adminSchema);