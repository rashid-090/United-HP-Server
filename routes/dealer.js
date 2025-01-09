const express = require("express");
const upload = require("../middleware/upload");
const { getEnquiries, updateEnquiry, getPendingEnquiries, getEnquiry } = require("../controllers/dealer/dealerController");



const router = express.Router();

router.get("/enquiries", getEnquiries);
router.get("/pending-enquiries", getPendingEnquiries);
router.get("/enquiry/:id", getEnquiry);
router.patch("/enquiry/:id", updateEnquiry);



module.exports = router;
