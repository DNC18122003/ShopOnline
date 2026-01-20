const uploadRouter = require("./upload");
const cartRouter = require("./order/cart.route")
module.exports = (app) => {
  const api = "/api";
  app.use(api + "/upload", uploadRouter);//Test upload
  app.use(api + "/cart", cartRouter);
};
