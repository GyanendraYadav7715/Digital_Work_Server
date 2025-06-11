const requestLogger =(req, res, next) => {
    console.log("🟡 Incoming Request:");
    console.log("🔸 Method:", req.method);
    console.log("🔸 URL:", req.originalUrl);
    console.log("🔸 Headers:", req.headers);
    console.log("🔸 Query:", req.query);
    console.log("🔸 Params:", req.params);
    console.log("🔸 Body:", req.body);
    console.log("🔸 Cookies:", req.cookies);
    console.log("─────────────────────────────");
    next();
};

module.exports = requestLogger;

