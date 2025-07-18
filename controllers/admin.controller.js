const Admin = require("../models/admin.model");
const bcrypt = require("bcryptjs");

module.exports.registerAdmin = async (req, res) => {
    try {
        const { username, name, password, user_role, balance, redirect, location } = req.body;

        if (!username || !name || !password || !user_role) {
            return res.status(400).json({ message: "All required fields must be filled." });
        }

        const existingAdmin = await Admin.findOne({ username });
        if (existingAdmin) {
            return res.status(409).json({ message: "Admin with this username already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = new Admin({
            username,
            name,
            password: hashedPassword,
            user_role,
            balance: balance || 0,
            redirect: redirect || "/superadmin",
            location: location || { lat: 0, lng: 0 }
        });

        await newAdmin.save();
        res.status(201).json(
            {
                message: "Admin registered successfully.",
                adminId: newAdmin._id
            });
    } catch (error) {
        res.status(500).json(
            {
                message: "Internal server error."
            });
    }
};
module.exports.addAdminBalance = async (req, res) => {
    try {
        const { adminId, amount } = req.body;

        if (!adminId || amount == null) {
            return res.status(400).json({ message: "Admin ID and amount are required." });
        }

        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(404).json({ message: "Admin not found." });
        }

        admin.balance += amount;
        await admin.save();

        return res.status(200).json({
            message: "Balance added successfully.",
            newBalance: admin.balance
        });
    } catch (error) {
        console.error("Add balance error:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};
module.exports.updateAdminCredentials = async (req, res) => {
    try {
        const { adminId, newUsername, newPassword } = req.body;

        if (!adminId || (!newUsername && !newPassword)) {
            return res.status(400).json({ message: "Admin ID and at least one field (username or password) are required." });
        }

        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(404).json({ message: "Admin not found." });
        }

        // Check for username conflict
        if (newUsername && newUsername !== admin.username) {
            const existing = await Admin.findOne({ username: newUsername });
            if (existing) {
                return res.status(409).json({ message: "Username already taken." });
            }
            admin.username = newUsername;
        }

        if (newPassword) {
            const hashed = await bcrypt.hash(newPassword, 10);
            admin.password = hashed;
        }

        await admin.save();

        return res.status(200).json({ message: "Credentials updated successfully." });

    } catch (error) {
        console.error("Update credentials error:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};




