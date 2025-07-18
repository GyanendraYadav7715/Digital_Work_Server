const adminModel = require("../models/admin.model");
const retailerModel = require("../models/retailer.model");
const backofficeModel = require("../models/backoffice.model");
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const { createUserByAdminService } = require("../services/auth.service");
const {haversineDistance} = require("../utils/haversine")

module.exports.createUserByAdmin = async (req, res) => {
    const {
        username,
        name,
        password,
        balance,
        email,
        phone_number,
        user_role,
        location,
    } = req.body;

    const adminId = req.user.id;

    if (!username || !name || !password || !balance || !user_role) {
        return res.status(400).json({
            success: false,
            message: "All required fields not provided",
        });
    }

    try {
        const { token, savedUser, remainingBalance } =
            await createUserByAdminService({
                adminId,
                userData: {
                    username,
                    name,
                    password,
                    balance,
                    email,
                    phone_number,
                    user_role,
                    location,
                },
            });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(201).json({
            success: true,
            message: `${user_role} created successfully`,
            userId: savedUser._id,
            remainingAdminBalance: remainingBalance,
        });
    } catch (error) {
        console.error("Create user error:", error.message);
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to create user",
        });
    }
};


const getModelByRole = (role) => {
    switch (role) {
        case "Superadmin": return { model: adminModel, redirect: "/superadmin" };
        case "Retailer": return { model: retailerModel, redirect: "/retailer" };
        case "BackOffice": return { model: backofficeModel, redirect: "/backOffice" };
        default: return null;
    }
};

module.exports.login = async (req, res) => {
    const { username, password, user_role, latitude, longitude } = req.body;
 
    if (!username || !password || !user_role || latitude == null || longitude == null) {
        return res.status(400).json({
            success: false,
            message: "All fields including location are required",
        });
    }

    const roleData = getModelByRole(user_role);
    if (!roleData) {
        return res.status(403).json({
            success: false,
            message: "Invalid user role",
        });
    }

    try {
        const { model, redirect } = roleData;
        const user = await model.findOne({ username, user_role });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (user.isUserblocked) {
            return res.status(403).json({ success: false, message: "User is blocked" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid password" });
        }

        // 📍 Retailer Location Enforcement
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
                    return res.status(403).json({
                        success: false,
                        message: "Access denied. You moved outside your 50m login zone. Account blocked.",
                    });
                }
            }
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
        });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            success: true,
            message: "Login successful",
            user_role,
            redirect,
            name: user.name,
            token,
        });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};





 
