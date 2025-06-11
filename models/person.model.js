const mongoose = require("mongoose");

const personSchema = new mongoose.Schema({
    
    user_role: {
        type: String,
        required:true
    },
    applied_by: {
        type: String,
        required: true
    },
    purpose: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    father_name: {
        type: String,
        required: true,
    },
    DOB: {
        type: String,
        required: true,
    },
    aadhaar_number: {
        type: Number,
        required: true,
    },
    mobile_number: {
        type: Number,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        default: "inProgress",
    },
    ackUrl: {
        type: String,
        default: "",
    },
    oSlip: {
        type: String,
        default: "",
    },

    remarks: {
        type: String,
        default: "",
    },
    proof: [
        {
            POI: String,

            POB: String,

            POA: String,
        },
    ],
    finger_prints: [
        {
            FingerPrint1: String,

            FingerPrint2: String,

            FingerPrint3: String,

            FingerPrint4: String,

            FingerPrint5: String,
        },
    ],
    created_at: {
        type: Date,
        default: Date.now,
    },

},)

module.exports = mongoose.model("person", personSchema);