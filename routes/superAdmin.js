const express = require("express");
const { getAdmins, addAdmin, getAdmin, blockOrUnBlock, updateAdmin, deleteAdmin } = require("../controllers/admin/adminController");
const upload = require("../middleware/upload");
const { createDistrict, getDistricts, updateDistrict, deleteDistrict } = require("../controllers/admin/districtController");
const { createCity, getCities, updateCity, deleteCity } = require("../controllers/admin/cityController");
const { authenticateUser, verifySuperAdmin } = require("../middleware/authMiddleware");



const router = express.Router();

// Address
router.get("/user", getAdmins);
router.get("/user/:id", getAdmin);
router.delete("/user/:id", deleteAdmin);
router.patch("/user/:id", upload.any(), updateAdmin);
router.post("/user", upload.any(), addAdmin);
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

// Permissions
// router.get("/permissions", authenticateUser, getPermissions); // List all permissions
// router.post("/permissions", authenticateUser, verifySuperAdmin, addPermission); // Add a new permission
// router.patch("/permissions/:id", authenticateUser, verifySuperAdmin, updatePermission); // Update a permission
// router.delete("/permissions/:id", authenticateUser, verifySuperAdmin, deletePermission); // Delete a permission




module.exports = router;
