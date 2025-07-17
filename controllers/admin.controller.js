const Admin = require("../models/admin.model");
const bcrypt = require("bcryptjs");

/**
 * @desc    Register a new admin manually
 * @route   POST /api/admin/register
 * @access  Private/Internal
 */
module.exports.registerAdmin = async (req, res) => {
    try {
        const { username, name, password, user_role, balance, redirect, location } = req.body;

        // Validation check
        if (!username || !name || !password || !user_role) {
            return res.status(400).json({ message: "All required fields must be filled." });
        }

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ username });
        if (existingAdmin) {
            return res.status(409).json({ message: "Admin with this username already exists." });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create admin
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

        res.status(201).json({ message: "Admin registered successfully.", adminId: newAdmin._id });
    } catch (error) {
        console.error("Error registering admin:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

 
