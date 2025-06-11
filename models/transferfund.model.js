const mongoose = require('mongoose');

const tansferfundSchema = new mongoose.Schema({
    sender: {
        type: String,
        required: true
    },
    recipient: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true,
        default: 0
    },
    status: {
        type: String,

    },
    transferDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("balanceTransfer", tansferfundSchema);
