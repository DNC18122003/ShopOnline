const Order = require("../models/Order/Order");
const User = require("../models/User");
const getTotalOrder = async (req, res) => {
    // trả về số lượng đơn hàng đã hoàn thành
    try {
        const totalCompletedOrders = await Order.countDocuments({
            orderStatus: "completed"
        });

        res.status(200).json({
            success: true,
            totalCompletedOrders
        });

    } catch (error) {
        console.error("Error getting total orders:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy tổng số đơn hàng"
        });
    }
};
const createNewEmployee = async (req, res) => {
    try {
        const { fullName, email, password, role } = req.body;
        // validate data
        if (!fullName.trim() || !email.trim() || !password.trim() || !role.trim()) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp đầy đủ thông tin"
            });
        }
        const fullNameParsed = fullName.trim();
        const emailParsed = email.trim().toLowerCase();
        const passwordParsed = password.trim();
        const roleParsed = role.trim().toLowerCase();
        console.log('Parsed form data:', { fullNameParsed, emailParsed, passwordParsed, roleParsed });
        // Kiểm tra nếu email đã tồn tại
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email đã tồn tại"
            });
        }
        // tạo userName mới
        let userName = "";
        if (role === "sale") {
            const saleCount = await User.countDocuments({ role: "sale" });
            console.log('Sale count:', saleCount);
            userName = `sale${saleCount + 1}`;
        } else if (role === "staff") {
            const staffCount = await User.countDocuments({ role: "staff" });
            userName = `staff${staffCount + 1}`;
        } else {
            const adminCount = await User.countDocuments({ role: "admin" });
            userName = `admin${adminCount + 1}`;
        }
        // tạo nhân viên 
        const newEmployee = new User({
            fullName: fullNameParsed,
            email: emailParsed,
            password: passwordParsed,
            role: roleParsed,
            userName,
            isActive: true
        });
        const newEmployeeSaved = await newEmployee.save();
        res.status(200).json({
            success: true,
            message: "Tạo nhân viên mới thành công",
            data: newEmployeeSaved
        });
    } catch (error) {
        console.error("Error creating new employee:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi tạo nhân viên"
        });
    }
}
module.exports = { getTotalOrder, createNewEmployee };