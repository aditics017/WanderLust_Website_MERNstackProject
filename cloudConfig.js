const cloudinary = require("cloudinary").v2; 
const { CloudinaryStorage } = require("multer-storage-cloudinary"); 

// Configure Cloudinary with environment variables
cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.CLOUD_API_KEY, 
  api_secret: process.env.CLOUD_API_SECRET,
}); 

// Set up Cloudinary storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'Wanderlust_DEV',  // specify the folder name
    allowedFormats: ["jpg", "png", "jpeg"],
  },
});

module.exports = { cloudinary, storage }