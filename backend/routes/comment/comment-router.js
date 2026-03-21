const express = require("express");
const commentController = require("../../controller/comment/commentController");
const { isAuth } = require("../../middleware/authorization");
const router = express.Router();
router.get("/:productId", commentController.getCommentsByProduct);
router.post("/", commentController.createComment);
router.get("/", commentController.getAllComments);
router.put("/:id", commentController.updateCommentStatus);
module.exports = router;
