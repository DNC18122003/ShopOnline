require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./configs/db.connect");
const cloudinary = require("./configs/cloudinary");
const router = require("./routes/index");
const app = express();
const cookieParser = require("cookie-parser");
const passport = require("passport");
const { passportConfig } = require("./configs/passport");
app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: [process.env.FRONTEND_URL , "http://localhost:5173"],
    methods:'GET, HEAD, PUT, PATCH, POST, DELETE'
  }),
);
app.use(cookieParser());
// === CẤU HÌNH PASSPORT TẠI ĐÂY ===
app.use(passport.initialize());
passportConfig(passport);
//Routers
router(app);

connectDB(); // connectDB

app.get("/", (req, res) => {
  res.send("Server is running with MongoDB Atlas !!!");
});

const PORT = process.env.PORT || 9999;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
