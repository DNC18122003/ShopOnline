const { default: mongoose } = require("mongoose");
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
            isActive: "inactive"
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
const updateUserStatus = async (req, res) => {
    try {
        const { id, status } = req.body;
        if (!id || !status) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp đày đủ thông tin"
            });
        }
        const user = await User.findById(id);
        if (!user) {
            //console.log('User not found with ID:', id);
            return res.status(400).json({
                success: false,
                message: "Người dùng không tồn tại"
            });
        }
        user.isActive = status;
        await user.save();
        res.status(200).json({
            success: true,
            message: "Cập nhật trạng thái người dùng thành công",
            data: user
        });
    } catch (error) {
        console.error("Error updating user status:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi cập nhật trạng thái người dùng"
        });
    }
}
const getDetailAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp ID người dùng"
            });
        }
        const user = await User.findById(id).select("-password");
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Người dùng không tồn tại"
            });
        }
        res.status(200).json({
            success: true,
            message: "Lấy chi tiết người dùng",
            data: user
        });
    } catch (error) {
        console.error("Error getting user details:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy chi tiết người dùng"
        });
    }
}
const getDetailStaff = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp ID người dùng"
            });
        }
        //  cần lấy thông tin sau : 
        /*
        name: 
    email:
    userName: 
    fullName: 
    phone: 
    avatar:
    role:
    joinedDate:
    status: 
    productsCreated: 
    },
        */
        let pipeline = []
        pipeline.push({ $match: { _id: new mongoose.Types.ObjectId(id) } });
        pipeline.push({
            $lookup: {
                from: "cpus",
                localField: "_id",
                foreignField: "createdBy",
                as: "cpus"
            }
        });

        pipeline.push({
            $lookup: {
                from: "gpus",
                localField: "_id",
                foreignField: "createdBy",
                as: "gpus"
            }
        });

        pipeline.push({
            $lookup: {
                from: "mainboards",
                localField: "_id",
                foreignField: "createdBy",
                as: "mainboards"
            }
        });

        pipeline.push({
            $lookup: {
                from: "rams",
                localField: "_id",
                foreignField: "createdBy",
                as: "rams"
            }
        });

        // Tính toán tổng số sản phẩm
        pipeline.push({
            $addFields: {
                totalProducts: {
                    $sum: [
                        { $size: "$cpus" },      // Số lượng cpus
                        { $size: "$gpus" },      // Số lượng gpus
                        { $size: "$mainboards" },// Số lượng mainboards
                        { $size: "$rams" }       // Số lượng rams
                    ]
                }
            }
        });
        pipeline.push({
            $project: {
                email: 1,
                userName: 1,
                fullName: 1,
                phone: 1,
                avatar: 1,
                role: 1,
                createdAt: 1,
                isActive: 1,
                totalProducts: 1
            }
        });
        const user = await User.aggregate(pipeline);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Người dùng không tồn tại"
            });
        }
        res.status(200).json({
            success: true,
            message: "Lấy chi tiết người dùng",
            data: user
        });
    } catch (error) {
        console.error("Error getting user details:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy chi tiết người dùng"
        });
    }
}
const getDetailSales = async (req, res) => {
    console.log('Received request for sales details with ID:', req.params.id);
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp ID người dùng"
            });
        }
        /*
        cần lấy thông tin sau :
        name
        email
        userName
        fullName
        phone
        avatar
        role
        joinedDate
        status
        "bai viet da dang"
        "don hang da xu ly"
        "tong tien tao ra"
        */
        let pipeline = []
        // match user sales theo id
        pipeline.push({ $match: { _id: new mongoose.Types.ObjectId(id) } });
        // join blogs voi order de tinh tong dơn hàng
        pipeline.push(
            {
                $lookup: {
                    from: "blogs",
                    localField: "_id",
                    foreignField: "createdBy",
                    as: "blogs"
                }
            });
        pipeline.push(
            {
                $lookup: {
                    from: "orders",
                    localField: "_id",
                    foreignField: "createdBy",
                    as: "orders"
                }
            });
        // loc các đơn hàng đã hoàn thành
        pipeline.push({
            $addFields: {
                orders: {
                    $filter: {
                        input: "$orders",
                        as: "order",
                        cond: { $eq: ["$$order.orderStatus", "completed"] }
                    }
                }
            }
        });
        // tinh toan so don da xu ly va so tien da tao ra
        pipeline.push({
            $addFields: {
                processedOrders: { $size: "$orders" },
                generatedAmount: {
                    $sum: "$orders.finalAmount"
                },
                totalBlogs: { $size: "$blogs" }
            }
        });
        pipeline.push({
            $project: {
                email: 1,
                userName: 1,
                fullName: 1,
                phone: 1,
                avatar: 1,
                role: 1,
                createdAt: 1,
                isActive: 1,
                processedOrders: 1,
                generatedAmount: 1,
                totalBlogs: 1
            }
        });
        const user = await User.aggregate(pipeline);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Người dùng không tồn tại"
            });
        }
        res.status(200).json({
            success: true,
            message: "Lấy chi tiết người dùng",
            data: user
        });
    } catch (error) {
        console.error("Error getting user details:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy chi tiết người dùng"
        });
    }
}
const getDetailCustomer = async (req, res) => {
    console.log('Received request for customer details with ID:', req.params.id);
    /*
    Parse 1:
    cần lấy được 
     email: 1,
    userName: 1,
    fullName: 1,
    phone: 1,
    avatar: 1,
    role: 1,
    createdAt: 1,
    isActive: 1,
    "tong so tien chi tieu"
    "so don hang da dat"
    */
    /*
    Parse 2:
    list được cac dơn
    */

    try {
        const { id } = req.params;
        let pipeline = []
        // match user customer theo id
        pipeline.push({ $match: { _id: new mongoose.Types.ObjectId(id) } });
        // join order de tinh tong so tien chi tieu va so don hang da dat
        pipeline.push(
            {
                $lookup: {
                    from: "orders",
                    localField: "_id",
                    foreignField: "customerId",
                    as: "orders"
                }
            });
        // loc các đơn hàng đã hoàn thành
        pipeline.push({
            $addFields: {
                orders: {
                    $filter: {
                        input: "$orders",
                        as: "order",
                        cond: { $eq: ["$$order.orderStatus", "completed"] }
                    }
                }
            }
        });
        // tinh toan so don da xu ly va so tien da tao ra
        pipeline.push({
            $addFields: {
                processedOrders: { $size: "$orders" },
                generatedAmount: {
                    $sum: "$orders.finalAmount"
                }
            }
        });
        pipeline.push({
            $project: {
                email: 1,
                userName: 1,
                fullName: 1,
                phone: 1,
                avatar: 1,
                address: 1,
                role: 1,
                createdAt: 1,
                isActive: 1,
                processedOrders: 1,
                generatedAmount: 1,
                orders: 1
            }
        });
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp ID người dùng"
            });
        }
        const user = await User.aggregate(pipeline);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Người dùng không tồn tại"
            });
        }

        res.status(200).json({
            success: true,
            message: "Lấy chi tiết người dùng",
            data: user
        });
    } catch (error) {
        console.error("Error getting user details:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy chi tiết người dùng"
        });
    }
}
module.exports = { getTotalOrder, createNewEmployee, updateUserStatus, getDetailAdmin, getDetailStaff, getDetailSales, getDetailCustomer };