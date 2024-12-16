const express = require("express");
const { getAdmins, addAdmin, getAdmin, blockOrUnBlock, updateAdmin, deleteAdmin } = require("../controllers/admin/adminController");
const upload = require("../middleware/upload");
const { createDistrict, getDistricts, updateDistrict, deleteDistrict } = require("../controllers/admin/districtController");
const { createCity, getCities, updateCity, deleteCity } = require("../controllers/admin/cityController");



const router = express.Router();

// Address
router.get("/admins", getAdmins);
router.get("/admin/:id", getAdmin);
router.delete("/admin/:id", deleteAdmin);
router.patch("/admin/:id", upload.any(), updateAdmin);
router.post("/admin", upload.any(), addAdmin);
// router.patch("/admin-block-unblock/:id", blockOrUnBlock);
router.patch("/block-or-unblock/:id", blockOrUnBlock)


// district
router.post("/district", createDistrict)
router.get("/districts", getDistricts)
router.patch("/district/:id", updateDistrict)
router.delete("/district/:id", deleteDistrict)

// city
router.post("/city", createCity)
router.get("/cities", getCities)
router.patch("/city/:id", updateCity)
router.delete("/city/:id", deleteCity)

module.exports = router;
