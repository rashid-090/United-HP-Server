const express = require("express");
const upload = require("../middleware/upload");
const { getUserDataFirst, logoutUser, changePassword, editUser } = require("../controllers/userController");
const { getDealers, getCities, getDistricts, getStore, nearByDealers } = require("../controllers/user/dealerController");


const router = express.Router();

// To get user data on initial page load.
router.get("/", getUserDataFirst);

// Logout
router.get("/logout", logoutUser);

// Change User Password
router.post("/change-password", changePassword);

router.get('/dealers', getDealers)
router.get('/districts', getDistricts)
router.get('/cities', getCities)

router.get("/store/:id", getStore)

// Edit User profile
router.post("/edit-profile", upload.single("profileImgURL"), editUser);

router.get('/nearby-dealers',nearByDealers)

















// Endpoint to resolve short link and get Place Details
// router.get('/get-coordinates-from-place', async (req, res) => {
//     const placeId = req.query.placeId;  // The place ID extracted from the Google Maps URL

//     if (!placeId) {
//         return res.status(400).json({ error: 'Place ID is required' });
//     }

//     const response = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
//         params: {
//             placeid: placeId,
//             key: apiKey,
//         },
//     });
//     console.log(response);

//     try {

//         const data = response.data;
//         if (data.result && data.result.geometry) {
//             const { lat, lng } = data.result.geometry.location;
//             return res.json({ lat, lng });
//         } else {
//             return res.status(404).json({ error: 'Coordinates not found for the provided Place ID' });
//         }
//     } catch (error) {
//         return res.status(500).json({ error: 'Error fetching coordinates from Google Places API' });
//     }
// });


// Change User Password
// router.post("/change-password", changePassword);

// Products
// router.get("/products", getProducts);
// router.get("/product/:id", getProduct);
// router.get("/product-quantity/:id", getAvailableQuantity);
















module.exports = router;
