const multer = require("multer");
const path = require("path");

const cloudinary = require('../configs/cloudinary');
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedImages = ["image/jpeg", "image/jpg", "image/png"];
    const allowedVideos = ["video/mp4", "video/mov", "video/webm"];

    if (
      allowedImages.includes(file.mimetype) ||
      allowedVideos.includes(file.mimetype)
    ) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ hỗ trợ ảnh JPG/PNG hoặc video MP4/MOV"));
    }
  },
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

const uploadToCloudinary = async (files, folder = "pc_store/") => {
  const uploadPromises = files.map((file) => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      uploadStream.end(file.buffer);
    });
  });

  const results = await Promise.all(uploadPromises);

  return results.map((result, index) => ({
    Url: result.secure_url,
    IsPrimary: index === 0,
    Ordinal: index,
    AltText: files[index].originalname,
  }));
};
const uploadMediaToCloudinary = async (files, folder = "pc_store/") => {
  const uploadPromises = files.map((file) => {
    return new Promise((resolve, reject) => {
      const resourceType = file.mimetype.startsWith("video")
        ? "video"
        : "image";

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(file.buffer);
    });
  });

  const results = await Promise.all(uploadPromises);

  return results.map((result) => result.secure_url);
};

module.exports = { upload, uploadToCloudinary, uploadMediaToCloudinary };
