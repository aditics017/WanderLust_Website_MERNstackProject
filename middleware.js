const Listing = require("./models/listing")
const Review = require("./models/review")
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");


module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash("error", "You must be logged in to create a listing!");
        req.session.redirectUrl = req.originalUrl;
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async (req, res, next) => { 
    let { id } = req.params; 
    let listing = await Listing.findById(id);
    
    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    if (!listing.owner.equals(req.user._id)) { 
        req.flash("error", "You don't have permission to edit/delete this listing since you are not the owner!"); 
        return res.redirect(`/listings/${id}`); 
    }

    next(); 
};

// Middleware for validating listings
module.exports.validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
      let errMsg = error.details.map((el) => el.message).join(", ");
      throw new ExpressError(400, errMsg);
    }
    next();
  };

// middleware.js
module.exports.validateReview = (req, res, next) => {
    // Make sure you're passing the review object properly
    const { review } = req.body;

    if (!review || !review.rating || !review.comment) {
        // If any part of the review is missing, we flash an error and redirect
        req.flash("error", "Review rating and comment are required.");
        return res.redirect(`/listings/${req.params.id}`);
    }

    // Now validate the review using Joi schema
    const { error } = reviewSchema.validate({ review });
    
    if (error) {
        const msg = error.details.map((el) => el.message).join(", ");
        next(new ExpressError(400, msg));
    } else {
        next();
    }
};


module.exports.isReviewAuthor = async (req, res, next) => { 
    let { id, reviewId } = req.params; 
    let review = await Review.findById(reviewId); 
    if (!review.author.equals(res.locals.currUser._id)) { 
      req.flash("error", "You are not the author of this review"); 
      return res.redirect(`/listings/${req.params.id}`); 
    } 
    next();
  };


  module.exports.validateCategory = (req, res, next) => {
    const { category } = req.body.listing; // Access the categories from the form

    // Check if the category is not selected (either empty or missing)
    if (!category || category.length === 0) {
        req.flash('error', 'At least one category must be selected!');
        return res.redirect(`/listings/${req.params.id}/edit`); // Redirect to edit page
    }

    // If the category is valid, proceed to the next middleware
    next();
};


  
  