const express = require("express");
const router = express.Router();
const CompanyController = require("../controllers/CompanyController");

router.get("/getDetails/:email", CompanyController.getCompanyByName);

module.exports = router;
