const express = require("express");
const { authController } = require("../controllers");
// const { verifyToken, checkRole } = require("../middleware/auth");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
// router.post("/login", authController.login);

module.exports = router;
