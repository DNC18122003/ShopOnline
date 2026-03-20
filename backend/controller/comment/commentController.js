const Comment = require("../../models/Comments/Comment");
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
        .populate("userId", "userName role createdAt")
        .sort({ createdAt: -1 }) // Câu hỏi mới nhất lên trước
        .lean();

      // 2. Lấy danh sách ID của các câu hỏi gốc
      const rootCommentIds = rootComments.map((comment) => comment._id);

      // 3. Tìm tất cả các câu trả lời thuộc về các câu hỏi gốc ở trên
      const replies = await Comment.find({
        parentId: { $in: rootCommentIds },
        isActive: true,
      })
        .populate("userId", "userName role createdAt")
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
      // Chỉ lấy những trường sau
      const { productId, userId, content, parentId } = req.body;

      // Kiểm tra dữ liệu bắt buộc
      if (!content) {
        return res
          .status(400)
          .json({ success: false, message: "Thiếu thông tin nội dung" });
      }
      if (!productId) {
        return res
          .status(400)
          .json({ success: false, message: "Thiếu thông tin sản phẩm" });
      }
      if (!userId) {
        return res
          .status(400)
          .json({ success: false, message: "Thiếu thông tin người dùng" });
      }
      // Khởi tạo data
      const newCommentData = {
        productId,
        userId,
        content,
        parentId: parentId || null,
        isActive: true,
      };

      const newComment = await Comment.create(newCommentData);

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
  // 3. Lấy tất cả comment kèm theo thông tin sản phẩm cụ thể
  getAllComments: async (req, res) => {
    try {
      // Tìm tất cả các comment đang active
      const comments = await Comment.find()
        // Lấy thêm thông tin người dùng
        .populate("userId", "userName role createdAt")
        .populate({
          path: "productId",
          // Tìm các trường thông tin sản phẩm muốn hiển thị
          select: "name price stock images specifications.detail_json",
        })
        .sort({ createdAt: -1 }) // Mới nhất lên trước
        .lean();

      res.status(200).json({
        success: true,
        message: "Lấy danh sách tất cả comment thành công",
        data: comments,
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
