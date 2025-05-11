const express = require("express");
const router = express.Router();
const EnquiryController = require("../controllers/EnquiryController");

router.post("/enquiry", EnquiryController.create);
router.get("/enquiry", EnquiryController.listUserEnquiries);
router.get("/enquiry/:id", EnquiryController.fetchSingleEnquiry);

module.exports = router;
