const express = require("express");
const router = express.Router();
const ResponseController = require("../controllers/ResponseController");

router.post("/response", ResponseController.createResponse);
router.get("/response/:enquiry_id", ResponseController.fetchResponses);
router.get(
  "/response/:enquiry_id/price",
  ResponseController.fetchResponsesPrice
);
router.get(
  "/response/:enquiry_id/date",
  ResponseController.fetchResponsesDates
);

module.exports = router;
