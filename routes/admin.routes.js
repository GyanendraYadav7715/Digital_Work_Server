const express = require("express");
const router = express.Router();
const  admincontroller  = require("../controllers/admin.controller");

router.post("/register", admincontroller.registerAdmin);

module.exports = router;
