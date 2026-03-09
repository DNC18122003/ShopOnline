const Comment = require("../../models/Comments/Comment");

const getCommentsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    // 1. Lấy tất cả câu hỏi gốc (parentId = null)
    const rootComments = await Comment.find({
      productId,
      parentId: null,
      isActive: true,
    })
      .populate("userId", "fullName avatar role") // Lấy thông tin user (để FE biết ai là admin)
      .sort({ createdAt: -1 }) // Câu hỏi mới nhất lên đầu
      .lean();

    // 2. Lấy danh sách ID của các câu hỏi gốc
    const rootCommentIds = rootComments.map((comment) => comment._id);

    // 3. Tìm tất cả các câu trả lời thuộc về các câu hỏi gốc ở trên
    const replies = await Comment.find({
      parentId: { $in: rootCommentIds },
      isActive: true,
    })
      .populate("userId", "fullName avatar role")
      .sort({ createdAt: 1 }) // Câu trả lời cũ hơn xếp trước
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
};
module.exports = {
  getCommentsByProduct,
};
