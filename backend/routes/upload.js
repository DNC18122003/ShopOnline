const express = require("express");
const { upload, uploadToCloudinary } = require("../middleware/upload");

const router = express.Router();


router.post(
  "/images",
  upload.array("images", 5), // tối đa 5 ảnh
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "Không có file ảnh" });
      }

      const images = await uploadToCloudinary(
        req.files,
        "pc_store/"
      );

      res.json({
        message: "Upload thành công",
        images,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

module.exports = router;
