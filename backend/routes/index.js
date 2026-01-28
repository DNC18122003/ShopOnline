const uploadRouter = require("./upload");
const authRouter = require("./auth-router");
const cartRouter = require("./order/cart.route");
const orderRouter = require("./order/order.route");
const productRouter = require("./product/product.route");
const brandRouter = require("./brand.route");
const categoryRouter = require("./category.route");

module.exports = (app) => {
  const api = "/api";
  app.use(api + "/upload", uploadRouter);//Test upload
  app.use(api + "/auth", authRouter);
  app.use(api + "/cart", cartRouter);
  app.use(api + "/order", orderRouter);
  app.use(api + "/product", productRouter);
  app.use(api + "/brands", brandRouter);
  app.use(api + "/categories", categoryRouter);

};


