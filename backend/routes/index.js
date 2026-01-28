const uploadRouter = require("./upload");
const authRouter = require("./auth-router");
const cartRouter = require("./order/cart.route");
const orderRouter = require("./order/order.route");
const blogRouter = require("./Blog/blog-router");
const discountRouter = require('./discount/discount-router');
module.exports = (app) => {
  const api = "/api";
  app.use(api + "/upload", uploadRouter);//Test upload
  app.use(api + "/auth", authRouter);
  app.use(api + "/cart", cartRouter);
  app.use(api + "order", orderRouter);
  app.use(api + "/blog", blogRouter);
  app.use(api + "/discount", discountRouter);
};


