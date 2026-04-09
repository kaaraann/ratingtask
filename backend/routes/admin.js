const express = require("express");
const router = express.Router();
const { authenticateToken, authorize } = require("../middleware/auth");
const adminController = require("../controllers/adminController");

// All admin routes require authentication and admin role
router.use(authenticateToken, authorize("admin"));

// Dashboard
router.get("/dashboard", adminController.getDashboard);

// Store management
router.post("/stores", adminController.createStore);
router.get("/stores", adminController.getStores);
router.get("/stores/:id", adminController.getStoreDetails);
router.put("/stores/:id", adminController.updateStore);
router.delete("/stores/:id", adminController.deleteStore);

// User management
router.get("/users", adminController.getUsers);
router.get("/users/:id", adminController.getUserDetails);
router.post("/users", adminController.createUser);
router.delete("/users/:id", adminController.deleteUser);

module.exports = router;
