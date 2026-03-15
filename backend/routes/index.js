const uploadRouter = require("./upload");
const authRouter = require("./auth.route");
const cartRouter = require("./order/cart.route");
const orderRouter = require("./order/order.route");
const productRouter = require("./product/product.route");
const brandRouter = require("./brand.route");
const categoryRouter = require("./category.route");

const reviewRouter = require("./order/review.route");

const blogRouter = require("./Blog/blog-router");
const commentRouter = require("./comment/comment-router");
const discountRouter = require("./discount/discount-router");
const saleDashboardRouter = require("./saleDashboard/saleDashboard-router");
const customerRouter = require("./user.route");
const buildPcTemplateRouter = require("./buildPcTemplate.route");
const otpRouter = require("./otp.route");
module.exports = (app) => {
  const api = "/api";
  app.use(api + "/upload", uploadRouter); //Test upload
  app.use(api + "/auth", authRouter);
  app.use(api + "/cart", cartRouter);
  app.use(api + "/order", orderRouter);
  app.use(api + "/product", productRouter);
  app.use(api + "/brands", brandRouter);
  app.use(api + "/categories", categoryRouter);
  app.use(api + "/reviews", reviewRouter);
  app.use(api + "/review", reviewRouter);
  app.use(api + "/blogs", blogRouter);
  app.use(api + "/discounts", discountRouter);
  app.use(api + "/comments", commentRouter);
  app.use(api + "/customer", customerRouter);
  app.use(api + "/build-pc-template", buildPcTemplateRouter);
  app.use(api + "/otp", otpRouter);
  app.use(api + "/dashboard", saleDashboardRouter);
};
