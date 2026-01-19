const multer = require("multer");
const path = require("path");

const cloudinary = require('../configs/cloudinary');
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ hỗ trợ file ảnh JPEG/JPG/PNG"));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
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

module.exports = { upload, uploadToCloudinary };
