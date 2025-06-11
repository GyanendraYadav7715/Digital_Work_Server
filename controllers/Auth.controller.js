const adminModel = require("../Models/admin.model");
const retailerModel = require("../Models/retailer.model");
const backofficeModel = require("../Models/backoffice.model");
const bcrypt = require('bcryptjs')


 module.exports.login = async (req, res) => {
    const { username, password, user_role } = req.body;

    if (!username || !password || !user_role) {
        return res.status(400).json({
            success: false,
            message: "Invalid credentials"
        });
    }

    let user;
    let redirect;
    let model;

    try {
        switch (user_role) {
            case "Superadmin":
                model = adminModel;
                redirect = "/superadmin";
                break;
            case "Retailer":
                model = retailerModel;
                redirect = "/retailer";
                break;
            case "BackOffice":
                model = backofficeModel;
                redirect = "/BackOffice";
                break;
            default:
                return res.status(403).json({
                    success: false,
                    message: "Invalid user role"
                });
        }

        user = await model.findOne({ username, user_role });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

         if (user.isUserblocked) {
            return res.status(403).json({
                success: false,
                message: "User is blocked"
            });
        }

         if (password !== user.Password) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }
        return res.status(200).json({
            success: true,
            message: "Login successful",
            user_role,
            redirect,
            name: user.name,
         });

    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
 };

 module.exports.createUserByAdmin = async (req, res) => {
    const { username, name, password, balance, email, phone_number, user_role } = req.body;
    const adminId = req.user.id;  

    if (!username || !name || !password || !balance || !user_role) {
        return res.status(400).json({ success: false, message: "All required fields not provided" });
    }

    if (!["Retailer", "BackOffice"].includes(user_role)) {
        return res.status(400).json({ success: false, message: "Invalid user role" });
    }

    try {
        const admin = await adminModel.findById(adminId);

        if (!admin || admin.user_role !== "Superadmin") {
            return res.status(403).json({ success: false, message: "Only Superadmin can create users" });
        }

        if (admin.balance < balance) {
            return res.status(400).json({ success: false, message: "Insufficient admin balance" });
        }

        const existingUser =
            user_role === "Retailer"
                ? await retailerModel.findOne({ username })
                : await backofficeModel.findOne({ username });

        if (existingUser) {
            return res.status(400).json({ success: false, message: "Username already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const userData = {
            username,
            name,
            password: hashedPassword,
            balance,
            user_role,
            created_by: admin.username,
        };

        if (user_role === "Retailer") {
            if (!email || !phone_number) {
                return res.status(400).json({ success: false, message: "Email and phone number are required for retailer" });
            }
            userData.email = email;
            userData.phone_number = phone_number;
        }

        const newUser =
            user_role === "Retailer"
                ? new retailerModel(userData)
                : new backofficeModel(userData);

        await newUser.save();

        // Deduct balance from admin
        admin.balance -= balance;
        await admin.save();

        return res.status(201).json({
            success: true,
            message: `${user_role} created successfully`,
            userId: newUser._id,
            remainingAdminBalance: admin.balance,
        });

    } catch (error) {
        console.error("User creation error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


 
