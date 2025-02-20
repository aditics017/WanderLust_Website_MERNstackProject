const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing, validateCategory } = require("../middleware.js");

const listingController = require("../controllers/listings.js");

const multer = require("multer");  
const { storage } = require("../cloudConfig.js");  

const upload = multer({ storage });  


// Index Route
router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createRoute)
  );


// New Route (Form to create a listing)
router.get("/new", isLoggedIn, wrapAsync(listingController.renderNewForm));

// Show, Update, and Delete Routes (Details, Update, and Delete a listing)
router.route("/:id")
  .get(wrapAsync(listingController.showRoute))
  .put(
    isLoggedIn, 
    isOwner, 
    upload.single("listing[image]"),
    validateCategory,
    validateListing,  
    wrapAsync(listingController.updateRoute)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteRoute));



// Edit Route (Form to edit listing)
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.editRoute));

module.exports = router;
