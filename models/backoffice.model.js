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


})

module.exports = mongoose.model("backoffice", backofficeSchema);