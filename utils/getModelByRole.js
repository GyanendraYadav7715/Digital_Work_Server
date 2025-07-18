const adminModel = require("../models/admin.model");
const retailerModel = require("../models/retailer.model");
const backofficeModel = require("../models/backoffice.model");

const getModelByRole = (role) => {
    switch (role) {
        case "Superadmin": return { model: adminModel, redirect: "/superadmin" };
        case "Retailer": return { model: retailerModel, redirect: "/retailer" };
        case "BackOffice": return { model: backofficeModel, redirect: "/backOffice" };
        default: return null;
    }
};

const getUserModel = (role) => {
    switch (role) {
        case "Retailer": return retailerModel;
        case "BackOffice": return backofficeModel;
        default: return null;
    }
};

module.exports = { getModelByRole, getUserModel };
