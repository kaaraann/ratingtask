const express = require("express");
const router = express.Router();
const { authenticateToken, authorize } = require("../middleware/auth");
const storeOwnerController = require("../controllers/storeOwnerController");

// All store owner routes require authentication
router.use(authenticateToken, authorize("store_owner"));

// Dashboard
router.get("/dashboard", storeOwnerController.getDashboard);

// Store ratings
router.get("/store/ratings", storeOwnerController.getStoreRatings);
router.get("/store/average-rating", storeOwnerController.getAverageRating);

// Profile
router.get("/profile", storeOwnerController.getProfile);
router.put("/password", storeOwnerController.updatePassword);

module.exports = router;
