const mongoose = require("mongoose");

const backofficeSchema = new mongoose.Schema({

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
    isUserblocked: {
        type: Boolean,
        default: false,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    created_by: {
        type: String,
        default: "admin",
      },
    redirect: {
        type: String,
        default: "/backoffice",
    },
    location: {
        lat: { type: Number, default: 0 },
        lng: { type: Number, default: 0 },
    },
})

module.exports = mongoose.model("backoffice", backofficeSchema);