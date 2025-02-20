const Joi = require('joi');

module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    location: Joi.string().required(),
    country: Joi.string()
      .regex(/^[a-zA-Z\s]+$/) // Ensures only letters and spaces are allowed
      .required()
      .messages({ 
        "string.pattern.base": "Please check the country name format"
      }),
    price: Joi.number().required().min(0),
    category: Joi.array()
      .items(
        Joi.string().valid(
          'Trending', 
          'Rooms', 
          'Beachfront', 
          'Camping', 
          'Arctic Stays', 
          'City Apartments', 
          'Luxury', 
          'Mountain City'
        )
      )
      .min(1) // At least one category must be selected
      .required(),
    image: Joi.string().allow("", null) // Allows optional image
  }).required()
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    comment: Joi.string().required(),
  }).required(),
});
