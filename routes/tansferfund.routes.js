const express = require('express');
const router = express.Router();
const transeferFund = require("../controllers/transferFund.controller")

router.post("/tansferfund", transeferFund.postTransfer)
router.get("/tansferHistory", transeferFund.getTransfers)

module.exports = router;