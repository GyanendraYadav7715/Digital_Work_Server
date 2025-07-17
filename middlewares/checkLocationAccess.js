

const haversineDistance = (coords1, coords2) => {
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 6371e3; // Earth radius in meters

    const lat1 = coords1.lat;
    const lat2 = coords2.lat;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(coords2.lng - coords1.lng);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // distance in meters
};


const checkLocationAccess = async (req, res, next) => {
    const { latitude, longitude } = req.body;
    const userId = req.user.id; // from JWT decoded middleware

    if (!latitude || !longitude) {
        return res.status(403).json({ message: "Location required to access the system." });
    }

    const user = await User.findById(userId);

    const distance = haversineDistance(
        user.lastLoginLocation,
        { lat: latitude, lng: longitude }
    );

    if (distance > 50) {
        // ❌ Block the user
        user.status = "blocked";
        await user.save();
        return res.status(401).json({ message: "Access denied. Out of allowed zone. User is now blocked." });
    }

    if (user.status === "blocked") {
        return res.status(403).json({ message: "User is blocked." });
    }

    next();
};
