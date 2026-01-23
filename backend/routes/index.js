const uploadRouter = require("./upload");
const authRouter = require("./auth-router");
const cartRouter = require("./order/cart.route");
const orderRouter = require("./order/order.route");
module.exports = (app) => {
  const api = "/api";
  app.use(api + "/upload", uploadRouter);//Test upload
  app.use(api + "/auth", authRouter);
  app.use(api + "/cart", cartRouter);
  app.use(api + "order", orderRouter);
};


