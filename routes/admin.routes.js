const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");

// 🔹 Register new admin
router.post("/register", adminController.registerAdmin);

// 🔹 Add balance to admin
router.post("/add-balance", adminController.addAdminBalance);

// 🔹 Update admin username and/or password
router.put("/update-credentials", adminController.updateAdminCredentials);

module.exports = router;

