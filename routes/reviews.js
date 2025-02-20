const express = require("express");
const router = express.Router({ mergeParams: true }); // ✅ Merge params for nested routes
const wrapAsync = require("../utils/wrapAsync.js");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");

const listingController = require("../controllers/reviews.js");

// POST Route - `/listings/:id/reviews`
router.post( 
  "/:id/reviews", 
  isLoggedIn, 
  validateReview, 
  wrapAsync(listingController.post)
);

// DELETE Route for reviews
router.delete(
  "/:id/reviews/:reviewId",
  isLoggedIn,  
  isReviewAuthor,
  wrapAsync(listingController.delete)
);


module.exports = router;
