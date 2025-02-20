const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

const userController = require("../controllers/users.js");

// Signup Routes
router
  .route("/signup")
  .get(userController.getSignup)
  .post(wrapAsync(userController.postSignup));

// Login Routes
router
  .route("/login")
  .get(userController.getLogin)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    userController.postLogin
  );

// Logout Route
router.get("/logout", userController.getLogout);

module.exports = router;
