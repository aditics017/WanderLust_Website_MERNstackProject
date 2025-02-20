const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding'); // Fixed import
const mapToken = process.env.MAP_TOKEN; 
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
  let query = req.query.q; // Search query
  let category = req.query.category; // Selected category filter
  let filter = {}; // Initialize empty filter

  if (query) {
      const regex = new RegExp(query, "i"); // Case-insensitive search
      filter.title = regex; // Search by title
  }

  if (category && category !== "All") {
      filter.category = category; // Filter by category if selected
  }

  let listings = await Listing.find(filter); // Apply filters

  if (req.xhr) {
      return res.render("partials/listings.ejs", { listings }); // Return only listings for AJAX
  }

  res.render("listings/index.ejs", { listings, selectedCategory: category || "All" });
};


module.exports.renderNewForm = async (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showRoute = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested for, does not exist!");
    return res.redirect("/listings");
  }

  res.render("listings/show.ejs", { listing, mapToken });
};

module.exports.createRoute = async (req, res, next) => {
    let response = await geocodingClient
    .forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
    })
    .send();

    let url = req.file.path;
    let filename = req.file.filename;
    
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    newListing.category = req.body.listing.category || [];

    newListing.geometry = response.body.features[0].geometry;

    await newListing.save();

    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};

module.exports.editRoute = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url; 
  let updatedImageUrl = originalImageUrl.replace("/upload", "/upload/w_250,h_180"); // Resize image

  res.render("listings/edit.ejs", { listing, updatedImageUrl });
};

module.exports.updateRoute = async (req, res) => {
  let { id } = req.params;

  let listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }

  // Check if location has changed
  const newLocation = req.body.listing.location;
  if (newLocation && newLocation !== listing.location) {
    try {
      const geoData = await geocodingClient
        .forwardGeocode({
          query: newLocation,
          limit: 1
        })
        .send();

      if (geoData.body.features.length > 0) {
        listing.geometry = geoData.body.features[0].geometry; // Update geometry
      }
    } catch (error) {
      console.error("Error fetching geolocation:", error);
      req.flash("error", "Failed to update location coordinates.");
      return res.redirect(`/listings/${id}/edit`);
    }
  }

  // Update listing details
  listing.set(req.body.listing);

  // If a new image is uploaded, update it
  if (req.file) {
    listing.image = {
      url: req.file.path,
      filename: req.file.filename
    };
  }

  await listing.save();

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};


module.exports.deleteRoute = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted successfully!");
  res.redirect("/listings");
};
