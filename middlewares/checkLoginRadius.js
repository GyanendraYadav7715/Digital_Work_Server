const { haversineDistance } = require("../utils/haversine");
const retailerModel = require("../models/retailer.model");
const adminModel = require("../models/admin.model");
const backofficeModel = require("../models/backoffice.model");

const roleModelMap = {
    Retailer: retailerModel,
    Superadmin: adminModel,
    BackOffice: backofficeModel,
};

const checkLoginRadius = async (req, res, next) => {
    try {
        const { lat, lng } = req.body; // current location from client
        const userId = req.user.id;
        const userRole = req.user.user_role;

        const Model = roleModelMap[userRole];
        if (!Model) return res.status(400).json({ error: "Invalid role" });

        const user = await Model.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        const storedLocation = user.location;

        const distance = haversineDistance(
            { lat: storedLocation.lat, lng: storedLocation.lng },
            { lat, lng }
        );

        if (distance > 100) {
            return res.status(401).json({ message: "Out of allowed login radius" });
        }

        // ✅ Continue to next middleware or route
        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};

module.exports = checkLoginRadius;
