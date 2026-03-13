const Comment = require("../../models/Comments/Comment");
const commentController = {
  //1 lấy comment theo từng sản phẩms
 getCommentsByProduct : async (req, res) => {
  try {
    const { productId } = req.params;

    // 1. Lấy tất cả câu hỏi gốc (parentId = null)
    const rootComments = await Comment.find({
      productId,
      parentId: null,
      isActive: true,
    })
      .populate("userId", "userName role createdAt")
      .sort({ createdAt: -1 }) // Câu hỏi mới nhất lên đầu
      .lean();

    // 2. Lấy danh sách ID của các câu hỏi gốc
    const rootCommentIds = rootComments.map((comment) => comment._id);

    // 3. Tìm tất cả các câu trả lời thuộc về các câu hỏi gốc ở trên
    const replies = await Comment.find({
      parentId: { $in: rootCommentIds },
      isActive: true,
    })
      .populate("userId", "userName role createdAt")
      .sort({ createdAt: -1 }) // Câu trả lời mối hơn xếp trước
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
 createComment :   async (req, res) => {
  try {
    // Chỉ lấy những trường mình cho phép
    const { productId, userId, content, parentId } = req.body;

    // Kiểm tra dữ liệu bắt buộc
    if (!productId || !userId || !content) {
      return res.status(400).json({ success: false, message: "Thiếu thông tin bắt buộc" });
    }

    const newCommentData = {
      productId,
      userId,
      content,
      parentId: parentId || null, 
      isActive: true, 
    };

    const newComment = await comment.create(newCommentData);

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
}
};
module.exports = commentController;