const express = require("express");
const router = express.Router();
const { authenticateToken, authorize } = require("../middleware/auth");
const userController = require("../controllers/userController");

// All user routes require authentication and user role
router.use(authenticateToken, authorize("user"));

// Store operations
router.get("/stores", userController.getStores);
router.get("/stores/:id", userController.getStoreDetails);

// Rating operations
router.post("/stores/:id/rate", userController.submitRating);
router.put("/stores/:id/rate", userController.updateRating);
router.get("/my-ratings", userController.getMyRatings);

// Profile
router.get("/profile", userController.getProfile);
router.put("/password", userController.updatePassword);

module.exports = router;
