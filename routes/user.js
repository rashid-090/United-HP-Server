const express = require("express");
const upload = require("../middleware/upload");
const { getUserDataFirst, logoutUser, changePassword, editUser } = require("../controllers/userController");
const { getDealers, getCities, getDistricts, getStore, nearByDealers, readBanners } = require("../controllers/user/dealerController");
const { createEnquiry } = require("../controllers/user/enquiryController");
const { getProducts } = require("../controllers/user/productController");


const router = express.Router();

// To get user data on initial page load.
router.get("/", getUserDataFirst);

// Logout
router.get("/logout", logoutUser);

router.get("/products/:slug", getProducts)

// Change User Password
router.post("/change-password", changePassword);

router.get('/dealers', getDealers)
router.get('/districts', getDistricts)
router.get('/cities', getCities)

router.get("/store/:id", getStore)

// Edit User profile
router.post("/edit-profile", upload.single("profileImgURL"), editUser);

router.get('/nearby-dealers', nearByDealers)

router.get("/banners", readBanners)
    

router.post("/enquiry", createEnquiry)


module.exports = router;
