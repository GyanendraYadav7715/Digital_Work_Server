const transferFundService = require("../services/transferFund.service");

// Create a transfer
const postTransfer = async (req, res) => {
    try {
        const { sender, senderRole, recipient, recipientRole, amount } = req.body;

        if (!sender || !recipient || !senderRole || !recipientRole || !amount) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const result = await transferFundService.transferFunds({
            sender,
            senderRole,
            recipient,
            recipientRole,
            amount,
        });

        res.status(200).json(result);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//All transfers (optionally filter by sender/recipient)
const getTransfers = async (req, res) => {
    try {
        const { sender, recipient } = req.query;

        const filter = {};
        if (sender) filter.sender = sender;
        if (recipient) filter.recipient = recipient;

        const transfers = await transferFundService.getTransfers(filter);
        res.status(200).json({ success: true, data: transfers });

    } catch (error) {
        res.status(500).json({ success: false, message: "Could not retrieve transfers.", error: error.message });
    }
};

module.exports = {
    postTransfer,
    getTransfers
};
