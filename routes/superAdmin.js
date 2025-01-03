const express = require("express");
const { getUsers, addUser, getUser, blockOrUnBlockUser, updateUser, deleteUser } = require("../controllers/admin/userController");
const upload = require("../middleware/upload");
const { createDistrict, getDistricts, updateDistrict, deleteDistrict } = require("../controllers/admin/districtController");
const { createCity, getCities, updateCity, deleteCity } = require("../controllers/admin/cityController");
const { authenticateUser, verifySuperAdmin } = require("../middleware/authMiddleware");
const { getAdmins, getAdmin, deleteAdmin, updateAdmin, addAdmin, blockOrUnBlockAdmin } = require("../controllers/superAdmin/AdminController");



const router = express.Router();

// Address
router.get("/user", getUsers);
router.get("/user/:id", getUser);
router.delete("/user/:id", deleteUser);
router.patch("/user/:id", upload.any(), updateUser);
router.post("/user", upload.any(), addUser);
router.patch("/block-or-unblock-user/:id", blockOrUnBlockUser)


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


router.get("/admin", getAdmins);
router.get("/admin/:id", getAdmin);
router.delete("/admin/:id", deleteAdmin);
router.patch("/admin/:id", upload.any(), updateAdmin);
router.post("/admin", upload.any(), addAdmin);
router.patch("/block-or-unblock-admin/:id", blockOrUnBlockAdmin)



// Permissions
// router.get("/permissioans", authenticateUser, getPermissions); // List all permissions
// router.post("/permissions", authenticateUser, verifySuperAdmin, addPermission); // Add a new permission
// router.patch("/permissions/:id", authenticateUser, verifySuperAdmin, updatePermission); // Update a permission
// router.delete("/permissions/:id", authenticateUser, verifySuperAdmin, deletePermission); // Delete a permission




module.exports = router;
