const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

module.exports.post = async (req, res) => { 
    let listing = await Listing.findById(req.params.id); 
    if (!listing) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listings");
    }

    if (!req.body.review || !req.body.review.rating || !req.body.review.comment) { 
      req.flash("error", `Review is required! Debug Info: ${JSON.stringify(req.body)}`);
      return res.redirect(`/listings/${listing._id}`);
    }

    let newReview = new Review(req.body.review); 
    newReview.author = req.user._id; 
    await newReview.save(); 
    listing.reviews.push(newReview); 
    await listing.save(); 
    req.flash("success", "New Review Created!"); 
    res.redirect(`/listings/${listing._id}`); 
  }


module.exports.delete = async (req, res) => {
    let { id, reviewId } = req.params;

    // Pull the review from the listing
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

    // Delete the review itself
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${id}`);
  }