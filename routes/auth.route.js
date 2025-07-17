const express = require('express');
const router = express.Router();
const authcontroller = require('../controllers/auth.controller')
const {verifyToken}  = require("../middlewares/auth.middleware")

router.post('/login', authcontroller.login);
router.post('/register',verifyToken, authcontroller.createUserByAdmin);

module.exports = router;