const Admin = require("../models/admin.model");
const Retailer = require("../models/retailer.model");
const BackOffice = require("../models/backoffice.model");
const BalanceTransfer = require("../models/transferfund.model");

const getModelByRole = (role) => {
    switch (role.toLowerCase()) {
        case "admin": return Admin;
        case "retailer": return Retailer;
        case "backoffice": return BackOffice;
        default: throw new Error("Invalid user role");
    }
};

const createTransfer = async ({ sender, senderRole, recipient, recipientRole, amount }) => {
    const SenderModel = getModelByRole(senderRole);
    const RecipientModel = getModelByRole(recipientRole);

    const senderDoc = await SenderModel.findOne({ username: sender });
    const recipientDoc = await RecipientModel.findOne({ username: recipient });

    if (!senderDoc || !recipientDoc) {
        throw new Error("Sender or recipient not found in the system");
    }

    if (senderDoc.balance < amount) {
        throw new Error("Insufficient balance in sender account");
    }

    // Perform transfer
    senderDoc.balance -= amount;
    recipientDoc.balance += amount;

    // Save updated balances
    await senderDoc.save();
    await recipientDoc.save();

    // Save transaction log
    const transfer = new BalanceTransfer({
        sender,
        recipient,
        amount,
        status: "SUCCESS",
    });

    await transfer.save();

    return {
        message: "Transfer completed successfully",
        transferId: transfer._id,
    };
};


// Get all transfer records (optionally by sender/recipient)
const getTransfers = async (filter = {}) => {
    return await TransferFund.find(filter).sort({ transferDate: -1 });
};

module.exports = {
    createTransfer,
    getTransfers
};
