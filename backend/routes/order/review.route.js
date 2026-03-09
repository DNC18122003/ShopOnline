const express = require("express");
const reviewController = require("../../controller/order/review.controller");
const { isAuth } = require("../../middleware/authorization");
const { authenticateToken,checkRoleAndStatus} = require("../../middleware/authorization");
const router = express.Router();

router.post("/", authenticateToken,reviewController.createReview);

router.get("/product/:productId",authenticateToken, reviewController.getReviewsByProduct);

router.get("/my-reviews",authenticateToken, reviewController.getMyReviews);

router.put("/:id",authenticateToken, reviewController.updateReview);

router.delete("/:id",authenticateToken, reviewController.deleteReview);

module.exports = router;
