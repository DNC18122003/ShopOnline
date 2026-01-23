const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const hashPassword = require("../utils/hash-password");
const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      default: null,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    profileName: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: String,
    role: {
      type: String,
      enum: ["guest", "customer", "staff", "sale", "admin"],
      default: "guest",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

//module.exports = mongoose.model('User', userSchema);

// Tạo model từ schema
const User = mongoose.model("User", userSchema);

// Hàm tạo user admin mẫu
// const createAdminUser = async () => {
//     const hash_password = await hashPassword('a12345678');
//     try {
//         const admin = await User.create({
//             email: 'admin1@example.com',
//             password: hash_password,
//             profileName: 'Admin User',
//             phone: '123456789',
//             avatar: 'https://example.com/avatar.jpg',
//             role: 'admin',
//             isActive: true,
//         });
//         console.log('Admin user created:', admin);
//     } catch (err) {
//         console.error('Error creating admin user:', err);
//     }
// };

// // Gọi hàm createAdminUser khi muốn tạo admin (có thể gọi hàm này trong khi khởi động server)
// createAdminUser();

// Export model User để sử dụng ở các nơi khác
module.exports = User;
