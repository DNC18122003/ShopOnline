const uploadRouter = require("./upload");
const authRouter = require("./auth.route")
const cartRouter = require("./order/cart.route");
const orderRouter = require("./order/order.route");
const productRouter = require("./product/product.route");
const brandRouter = require("./brand.route");
const categoryRouter = require("./category.route");

const reviewRouter = require("./review.route");


const blogRouter = require("./Blog/blog-router");
const discountRouter = require('./discount/discount-router');

module.exports = (app) => {
  const api = "/api";
  app.use(api + "/upload", uploadRouter);//Test upload
  app.use(api + "/auth", authRouter);
  app.use(api + "/cart", cartRouter);
  app.use(api + "/order", orderRouter);
  app.use(api + "/product", productRouter);
  app.use(api + "/brands", brandRouter);
  app.use(api + "/categories", categoryRouter);
  app.use(api + "/reviews", reviewRouter);

  app.use(api + "/blog", blogRouter);
  app.use(api + "/discount", discountRouter);
};


