const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const adminModel = require("../models/admin.model");
const retailerModel = require("../models/retailer.model");
const backofficeModel = require("../models/backoffice.model");

const createUserByAdminService = async ({ adminId, userData }) => {
    const {
        username,
        name,
        password,
        balance,
        email,
        phone_number,
        user_role,
        location,
    } = userData;

    if (!["Retailer", "BackOffice"].includes(user_role)) {
        throw new Error("Invalid user role");
    }

    const admin = await adminModel.findById(adminId);
    if (!admin || admin.user_role !== "Superadmin") {
        throw new Error("Only Superadmin can create users");
    }

    if (admin.balance < balance) {
        throw new Error("Insufficient admin balance");
    }

    const existingUser =
        user_role === "Retailer"
            ? await retailerModel.findOne({ username })
            : await backofficeModel.findOne({ username });

    if (existingUser) {
        throw new Error("Username already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUserData = {
        username,
        name,
        password: hashedPassword,
        balance,
        user_role,
        created_by: admin.username,
        location: {
            lat: location?.lat || 0,
            lng: location?.lng || 0,
        },
    };

    if (user_role === "Retailer") {
        if (!email || !phone_number) {
            throw new Error("Email and phone number are required for retailer");
        }
        newUserData.email = email;
        newUserData.phone_number = phone_number;
    }

    const newUser =
        user_role === "Retailer"
            ? new retailerModel(newUserData)
            : new backofficeModel(newUserData);

    const savedUser = await newUser.save();

    // Deduct balance from admin
    admin.balance -= balance;
    await admin.save();

    const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

    return { token, savedUser, remainingBalance: admin.balance };
};

module.exports = {
    createUserByAdminService,
};
