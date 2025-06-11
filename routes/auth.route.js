const express = require('express');
const router = express.Router();
const authcontroller =require('../controllers/Auth.controller')

router.get('/login', authcontroller.login);
router.get('/register', authcontroller.createUserByAdmin);

module.exports = router;