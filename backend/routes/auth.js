const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Public routes
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/admin-register", authController.adminRegisterUser);

module.exports = router;
