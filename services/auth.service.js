const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const adminModel = require("../models/admin.model");
const retailerModel = require("../models/retailer.model");
const backofficeModel = require("../models/backoffice.model");


const getModelByRole = require("../utils/getModelByRole");
const {haversineDistance} = require("../utils/haversine");

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
        email,
        phone_number,
        user_role,
        created_by: admin.username,
        location: {
            lat: location?.lat || 0,
            lng: location?.lng || 0,
        },
    };

    const newUser =
        user_role === "Retailer"
            ? new retailerModel(newUserData)
            : new backofficeModel(newUserData);

    const savedUser = await newUser.save();

    admin.balance -= balance;
    await admin.save();

    const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

    return { token, savedUser, remainingBalance: admin.balance };
};

const loginService = async ({ username, password, user_role, latitude, longitude }) => {
    if (!username || !password || !user_role || latitude == null || longitude == null) {
        return { status: 400, body: { success: false, message: "All fields including location are required" } };
    }

    const roleData = getModelByRole(user_role);
    if (!roleData) {
        return { status: 403, body: { success: false, message: "Invalid user role" } };
    }

    const { model, redirect } = roleData;
    const user = await model.findOne({ username, user_role });

    if (!user) {
        return { status: 404, body: { success: false, message: "User not found" } };
    }

    if (user.isUserblocked) {
        return { status: 403, body: { success: false, message: "User is blocked" } };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return { status: 401, body: { success: false, message: "Invalid password" } };
    }

    // Location check for retailer
    if (user_role === "Retailer") {
        const currentCoords = { lat: latitude, lng: longitude };
        const savedCoords = user.location || { lat: 0, lng: 0 };

        if (savedCoords.lat === 0 && savedCoords.lng === 0) {
            user.location = currentCoords;
            await user.save();
        } else {
            const distance = haversineDistance(savedCoords, currentCoords);
            console.log(`📍 Distance from previous login: ${distance.toFixed(2)} meters`);

            if (distance > 20) {
                user.isUserblocked = true;
                await user.save();
                return {
                    status: 403,
                    body: {
                        success: false,
                        message: "Access denied. You moved outside your 50m login zone. Account blocked.",
                    },
                };
            }
        }
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

    return {
        status: 200,
        token,
        cookieOptions: {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        },
        body: {
            success: true,
            message: "Login successful",
            user_role,
            redirect,
            name: user.name,
            token,
        },
    };
};

 


module.exports = {
    createUserByAdminService,
    loginService
};
