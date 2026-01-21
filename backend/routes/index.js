const uploadRouter = require("./upload");
const authRouter = require("./auth-router");
module.exports = (app) => {
  const api = "/api";
  app.use(api + "/upload", uploadRouter);//Test upload
  app.use(api + "/auth", authRouter);
  
};


