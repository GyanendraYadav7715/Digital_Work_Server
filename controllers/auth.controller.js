const { createUserByAdminService, loginService } = require("../services/auth.service");

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



module.exports.login = async (req, res) => {
    try {
        const result = await loginService(req.body);

        if (result.token) {
            res.cookie("token", result.token, result.cookieOptions);
        }

        return res.status(result.status).json(result.body);
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
