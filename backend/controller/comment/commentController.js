const Comment = require("../../models/Comments/Comment");
const Product = require("../../models/Products/Product");
const Cpu = require("../../models/Products/CPU");
const Gpu = require("../../models/Products/GPU");
const Ram = require("../../models/Products/RAM");
const Mainboard = require("../../models/Products/Mainboard");
// Danh sách tất cả các model sản phẩm để dễ dàng populate
const ALL_MODELS = [
  { key: "cpu", model: Cpu },
  { key: "gpu", model: Gpu },
  { key: "ram", model: Ram },
  { key: "mainboard", model: Mainboard },
  { key: "product", model: Product },
];
// Hàm helper để lấy model theo productType
const getModelByType = (productType) => {
  switch (productType) {
    case "cpu":
      return Cpu;
    case "gpu":
      return Gpu;
    case "ram":
      return Ram;
    case "mainboard":
      return Mainboard;
    default:
      return Product;
  }
};
const commentController = {
  //1 lấy comment theo từng sản phẩm
  getCommentsByProduct: async (req, res) => {
    try {
      const { productId } = req.params;

      // 1. Lấy tất cả câu hỏi gốc (parentId = null)
      const rootComments = await Comment.find({
        productId,
        parentId: null,
        isActive: true,
      })
        .populate("userId", " userName role avatar")
        .sort({ createdAt: -1 }) // Câu hỏi mới nhất lên trước
        .lean();

      // 2. Lấy danh sách ID của các câu hỏi gốc
      const rootCommentIds = rootComments.map((comment) => comment._id);

      // 3. Tìm tất cả các câu trả lời thuộc về các câu hỏi gốc ở trên
      const replies = await Comment.find({
        parentId: { $in: rootCommentIds },
        isActive: true,
      })
        .populate("userId", "userName role avatar")
        .sort({ createdAt: -1 }) // Câu hỏi mới nhất lên trước
        .lean();

      // 4. Map các câu trả lời vào đúng câu hỏi gốc (Tạo mảng replies)
      const commentsWithReplies = rootComments.map((root) => {
        return {
          ...root,
          replies: replies.filter(
            (reply) => reply.parentId.toString() === root._id.toString(),
          ),
        };
      });

      res.status(200).json({
        success: true,
        data: commentsWithReplies,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
  //2 đăng tải comment
  createComment: async (req, res) => {
    try {
      const { productId, userId, userModel, content, parentId } = req.body;
      // Validate
      if (!content) {
        return res.status(400).json({
          success: false,
          message: "Thiếu thông tin nội dung",
        });
      }
      if (!productId) {
        return res.status(400).json({
          success: false,
          message: "Thiếu thông tin sản phẩm",
        });
      }
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "Thiếu thông tin người dùng",
        });
      }
      if (!userModel) {
        return res.status(400).json({
          success: false,
          message: "Thiếu thông tin loại người dùng",
        });
      }
      if (!["User", "Employee"].includes(userModel)) {
        return res.status(400).json({
          success: false,
          message: "userModel không hợp lệ",
        });
      }
      // Tạo comment
      const newComment = await Comment.create({
        productId,
        userId,
        userModel,
        content,
        parentId: parentId || null,
        isActive: true,
      });
      res.status(201).json({
        success: true,
        message: "Tạo comment thành công",
        data: newComment,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  getAllComments: async (req, res) => {
    try {
      const selectFields = "name price stock images specifications";

      // 1. Lấy danh sách comment cơ bản và populate user
      const comments = await Comment.find()
        .populate("userId", "userName role createdAt")
        .sort({ createdAt: -1 })
        .lean();

      // 2. Lặp qua từng comment để dò tìm productId trong TẤT CẢ các model
      const populatedComments = await Promise.all(
        comments.map(async (comment) => {
          if (!comment.productId) return comment;

          let productInfo = null;
          // Tìm xem productId này thuộc về Model nào trong ALL_MODELS
          for (const item of ALL_MODELS) {
            const Model = item.model;

            // Tìm thử trong model hiện tại
            const foundProduct = await Model.findById(comment.productId)
              .select(selectFields)
              .lean();

            // Nếu tìm thấy, gán data và dừng vòng lặp dò tìm cho comment này
            if (foundProduct) {
              productInfo = foundProduct;
              break;
            }
          }

          // Gắn thông tin sản phẩm tìm được vào comment
          comment.productInfo = productInfo;
          return comment;
        }),
      );

      res.status(200).json({
        success: true,
        message: "Lấy danh sách tất cả comment thành công",
        data: populatedComments,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  // 3. Sửa trạng thái của comment
  updateCommentStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      const updatedComment = await Comment.findByIdAndUpdate(
        id,
        { isActive },
        { new: true },
      );

      if (!updatedComment) {
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy comment" });
      }

      res.status(200).json({ success: true, data: updatedComment });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = commentController;
