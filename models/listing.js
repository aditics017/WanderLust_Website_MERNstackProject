const mongoose = require("mongoose");
const { Schema } = mongoose; 
const Review = require("./review.js");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  image: {
    url: String,
    filename: String,
  },
  price: {
    type: Number,
  },
  location: {
    type: String,
  },
  country: {
    type: String,
  },
  category: {
    type: [String],  // Allow an array of strings
    enum: ["Trending", "Rooms", "Beachfront", "Camping", "Arctic Stays", "City Apartments", "Luxury", "Mountain City"],
    required: true,
  },    
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  }, 
  geometry: { 
    type: { 
      type: String, 
      enum: ["Point"], 
      required: true, 
    }, 
    coordinates: { 
      type: [Number], 
      required: true, 
    },
  },  
});

// Middleware to delete associated reviews when a listing is deleted
listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } }); 
  }
});

// Creating a model for the schema
const Listing = mongoose.model("Listing", listingSchema);

// Exporting the model
module.exports = Listing;
