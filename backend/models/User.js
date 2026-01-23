const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const hashPassword = require('../utils/hash-password');
const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        default: null
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    userName: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    fullName: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    avatar: String,
    role: {
        type: String,
        enum: [ 'customer', 'staff', 'sale', 'admin'],
        default: 'customer'
    },
    isActive: {
        type: Boolean,
        default: true
    },
}, { timestamps: true });

//module.exports = mongoose.model('User', userSchema);

// Tạo model từ schema
const User = mongoose.model('User', userSchema);

// Hàm tạo user admin mẫu
// const createAdminUser = async () => {
//     const hash_password = await hashPassword('a12345678');
//     const users = [
//     {
//         email: 'admin1@example.com',
//         password: hash_password,
//         userName: 'admin1',
//         fullName: 'Admin One',
//         phone: '123456789',
//         role: 'admin',
//         isActive: true,
//     },
//     {
//         email: 'user1@example.com',
//         password: hash_password,
//         userName: 'user1',
//         fullName: 'User One',
//         phone: '987654321',
//         role: 'user',
//         isActive: true,
//     },
// ];
//     try {
//         await User.insertMany(users);
//     } catch (err) {
//         console.error('Error creating admin user:', err);
//     }
// };

// // Gọi hàm createAdminUser khi muốn tạo admin (có thể gọi hàm này trong khi khởi động server)
// createAdminUser();

// Export model User để sử dụng ở các nơi khác
module.exports = User;
