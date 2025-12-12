const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer storage
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "hostel_complaints", // folder name in Cloudinary
        allowed_formats: ["jpg", "jpeg", "png"],
    },
});

module.exports = { cloudinary, storage };
