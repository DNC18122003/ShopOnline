const mongoose = require('mongoose');
const User = require("../../models/User");

const getUsersCustomerController = async (req, res) => {
    try {
        const {
            search,
            status,
            sort,
            page = 1,
            limit = 9,
            fromPrice,
            toPrice,
            fromOrders,
            toOrders
        } = req.query;
        /*
    
        lấy được danh sách gôm các thong tin sau:
        {list: _id, email, name, phone, sum Orders, total Spent, status
    
        totalPages = totalPages}
    
        => can su dung aggregation để lấy được sum Orders và total Spent
        chuan bị : model User, khoi tao pipeline rong
    
        b1. su dung match de loc role = customer 
        b2 su dung su dung match de loc theo search va status 
        b3: su dung lookup de join bang orders ( can dieu kien là orderStatus = completed)
        b4: loc orderStatus = completed) bang cách ghi de : su dụng addFiels + filter de loc ôrderStatus
        b5: tinh toan sum Orders va total Spent bang addFields
        b6: loc theo fromPrice, toPrice, fromOrders, toOrders neu co
        b7: sort theo sort neu co
        b8: skip, limit de phan trang
    
        dau tien can match theo role, sau do match theo search va status, sau do group de tinh sum Orders va total Spent, sau do sort, skip, limit
        */
        // console.log("Query params:");
        // console.log("Search:", search);
        // console.log("Status:", status);
        // console.log("Sort:", sort);
        // console.log("From Price:", fromPrice);
        // console.log("To Price:", toPrice);
        // console.log("From Orders:", fromOrders);
        // console.log("To Orders:", toOrders);
        // validate data
        const currentPage = Number(page);
        const pageSize = Number(limit);
        const skip = (currentPage - 1) * pageSize;
        // 1. khoi tạo pipeline
        let pipeline = [];
        // step 1: match theo role
        let userMatch = { role: "customer" }
        //step 2: loc status (isActive) // sai can sua lai db
        if (status && status !== 'all') {
            userMatch.isActive = status === 'true';
        }
        // step 3: loc theo search
        if (search) {
            userMatch.fullName = {
                $regex: search, $options: "i"
            }
        }
        pipeline.push({ $match: userMatch });
        // step 4: looku de join voi bang orders 
        pipeline.push({
            $lookup: {
                from: "orders",
                localField: "_id",
                foreignField: "customerId",
                as: "orderHistory"
            }
        });
        // step 5 loc orderStatus
        pipeline.push({
            $addFields: {
                orderHistory: {
                    $filter: {
                        input: "$orderHistory",
                        as: "order",
                        cond: { $eq: ["$$order.orderStatus", "completed"] }
                    }
                }
            }
        });
        // step 6 tinh toan sumOrders va total Spent
        pipeline.push({
            $addFields: {
                sumOrders: { $size: "$orderHistory" },
                totalSpent: { $sum: "$orderHistory.finalAmount" }
            }
        });
        // step 7: loc theo formPrice, toPrice
        let statsMatch = {};
        if (fromPrice || toPrice) {
            statsMatch.totalSpent = {};
            if (fromPrice) statsMatch.totalSpent.$gte = Number(fromPrice);
            if (toPrice) statsMatch.totalSpent.$lte = Number(toPrice);

        }
        // step 8: loc theo fromOrders, toOrders
        if (fromOrders || toOrders) {
            statsMatch.sumOrders = {};
            if (fromOrders) statsMatch.sumOrders.$gte = Number(fromOrders);
            if (toOrders) statsMatch.sumOrders.$lte = Number(toOrders);
        }
        if (Object.keys(statsMatch).length > 0) {
            pipeline.push({ $match: statsMatch });
        }
        // step 9: sort asc- tăng, desc- giảm
        let sortOption = { createdAt: -1 };

        if (sort === "spent-desc") sortOption = { totalSpent: -1 };
        if (sort === "spent-asc") sortOption = { totalSpent: 1 };

        if (sort === "orders-desc") sortOption = { sumOrders: -1 };
        if (sort === "orders-asc") sortOption = { sumOrders: 1 };

        if (sort === "name-asc") sortOption = { userName: 1 };
        if (sort === "name-desc") sortOption = { userName: -1 };

        if (sort === "newest") sortOption = { createdAt: -1 };
        if (sort === "oldest") sortOption = { createdAt: 1 };

        pipeline.push({ $sort: sortOption });

        // loai bo cac field khong can thiet
        pipeline.push({
            $project: {
                email: 1,
                userName: 1,
                phone: 1,
                avatar: 1,
                sumOrders: 1,
                totalSpent: 1,
                isActive: 1,
            }
        });

        //final 
        //console.log("Pipeline after match:", JSON.stringify(pipeline, null, 2));
        const customer = await User.aggregate([
            ...pipeline,
            { $skip: skip },
            { $limit: pageSize }
        ]);
        // tinh tong so luong de tinh totalPages
        const totalCustomers = await User.aggregate([
            ...pipeline,
            { $count: "total" }
        ]);
        const total = totalCustomers.length > 0 ? totalCustomers[0].total : 0;


        // 10. Response
        res.status(200).json({
            success: true,
            data: customer,
            pagination: {
                totalItems: total,
                page: currentPage,
                limit: pageSize,
            },
        });

    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi khi lấy danh sách khách hàng"
        });
    }
};

const getNumberOfUser = async (req, res) => {
    /* trả về số lượng user
    {
    tổng số khách hàng: --,
    tổng số nhân viên: --,
    tổng số sale: --,
    */
    try {
        const totalCustomers = await User.countDocuments({ role: "customer" });
        const totalStaffs = await User.countDocuments({ role: "staff" });
        const totalSales = await User.countDocuments({ role: "sale" });

        res.status(200).json({
            success: true,
            data: {
                totalCustomers,
                totalStaffs,
                totalSales
            }
        });

    } catch (error) {
        console.error("Error getting number of users:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy số lượng user"
        });
    }
};
const getUserSaleController = async (req, res) => {
    try {
        const {
            search,
            status,
            sort,
            page = 1,
            minGeneratedAmount,
            maxGeneratedAmount,
            fromOrders,
            toOrders,
            limit = 9
        } = req.query;
        /*
        Bai toan can lay danh sach sale như sau :
        + list [{
        _id avatar email userName phone "số đơn đã xử lý" "số tiền đã tạo ra" isActive  
        }]
        cần join bảng order và lấy các đơn hàng đã hoàn thành do sale đó xử lý để tính toán số đơn đã xử lý và số tiền đã tạo ra

        + pagnination

        */
        // console.log("Query params:");
        // console.log("Search:", search);
        // console.log("Status:", status);
        // console.log("Sort:", sort);
        // console.log("From Price:", minGeneratedAmount);
        // console.log("To Price:", maxGeneratedAmount);
        // console.log("From Orders:", fromOrders);
        // console.log("To Orders:", toOrders);

        // validate data
        const currentPage = Number(page);
        const pageSize = Number(limit);
        const skip = (currentPage - 1) * pageSize;
        // 1. Khoi tạo pipleline
        let pipeline = [];
        // step 1: match theo role
        let userMatch = { role: "sale" }
        // step 2: loc theo search va status
        if (status && status !== 'all') {
            userMatch.isActive = status === 'active' ? true : false;
        }
        // step 3: loc theo search
        if (search) {
            userMatch.userName = { $regex: search, $options: 'i' };
        }
        pipeline.push({ $match: userMatch });
        // step 4: lookup de join voi bang orders
        pipeline.push({
            $lookup: {
                from: "orders",
                localField: "_id",
                foreignField: "saleId",
                as: "orders"
            }
        });
        // step 5: loc orderStatus = completed
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
        // step 6: tinh toan so don da xu ly va so tien da tao ra
        pipeline.push({
            $addFields: {
                processedOrders: { $size: "$orders" },
                generatedAmount: {
                    $sum: "$orders.finalAmount"
                }
            }
        });
        // step 7: loc theo minGeneratedAmount, maxGeneratedAmount
        let statsMatch = {};
        if (minGeneratedAmount || maxGeneratedAmount) {
            statsMatch.generatedAmount = {};
            if (minGeneratedAmount) statsMatch.generatedAmount.$gte = Number(minGeneratedAmount);
            if (maxGeneratedAmount) statsMatch.generatedAmount.$lte = Number(maxGeneratedAmount);
        }
        if (fromOrders || toOrders) {
            statsMatch.processedOrders = {};
            if (fromOrders) statsMatch.processedOrders.$gte = Number(fromOrders);
            if (toOrders) statsMatch.processedOrders.$lte = Number(toOrders);
        }
        if (Object.keys(statsMatch).length > 0) {
            pipeline.push({ $match: statsMatch });
        }
        // step 8: sort newest, oldest, generatedAmount-asc, generatedAmount-desc, orders-asc, orders-desc
        let sortOption = { createdAt: -1 };

        if (sort === "generatedAmount-asc") sortOption = { generatedAmount: 1 };
        if (sort === "generatedAmount-desc") sortOption = { generatedAmount: -1 };

        if (sort === "orders-asc") sortOption = { processedOrders: 1 };
        if (sort === "orders-desc") sortOption = { processedOrders: -1 };

        if (sort === "newest") sortOption = { createdAt: -1 };
        if (sort === "oldest") sortOption = { createdAt: 1 };
        pipeline.push({ $sort: sortOption });

        // step 9: loc theo field can thiet
        pipeline.push({
            $project: {
                email: 1,
                userName: 1,
                phone: 1,
                avatar: 1,
                processedOrders: 1,
                generatedAmount: 1,
                isActive: 1,
            }
        });
        // step 9: pagniation
        const sales = await User.aggregate([
            ...pipeline,
            { $skip: skip },
            { $limit: pageSize }
        ]);
        // tinh tong so luong de tinh totalPages
        const totalSales = await User.aggregate([
            ...pipeline,
            { $count: "total" }
        ]);
        const total = totalSales.length > 0 ? totalSales[0].total : 0;
        const totalPages = Math.ceil(total / pageSize);
        // return response
        res.status(200).json({
            success: true,
            data: sales,
            pagination: {
                page: currentPage,
                limit: pageSize,
                total,
                totalPages
            }
        });
    }
    catch (error) {
        console.error("Error fetching sale users:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi khi lấy danh sách sale"
        });
    }
}
const getUserStaffController = async (req, res) => {
    try {
        const {
            search,
            status,
            sort,
            page = 1,
            limit = 9,
        } = req.query;
        /*
        bai toan can lay danh sach staff nhu sau :
+ list [{
_id avatar email userName phone isActive  "tong so san pham da them vao he thong"
}]
        */
        const currentPage = Number(page);
        const pageSize = Number(limit);
        const skip = (currentPage - 1) * pageSize;
        let pipeline = [];
        // step 1: match theo role
        let userMatch = { role: "staff" }
        // step 2: loc theo search va status
        if (status && status !== 'all') {
            userMatch.isActive = status === 'active' ? true : false;
        }
        // step 3: loc theo search
        if (search) {
            userMatch.userName = { $regex: search, $options: 'i' };
        }
        pipeline.push({ $match: userMatch });
        // step 4: lookup de join voi bang products
        pipeline.push({
            $lookup: {
                from: "products",
                localField: "_id",
                foreignField: "createdBy",
                as: "products"
            }
        });
        // tinh toán tong so san pham
        pipeline.push({
            $addFields: {
                totalProducts: { $size: "$products" }
            }
        });
        // step 5: sort newest, oldest, totalProducts-asc, totalProducts-desc
        let sortOption = { createdAt: -1 };

        if (sort === "newest") sortOption = { createdAt: -1 };
        if (sort === "oldest") sortOption = { createdAt: 1 };
        pipeline.push({ $sort: sortOption });
        // step 6: loc theo field can thiet
        pipeline.push({
            $project: {
                email: 1,
                userName: 1,
                phone: 1,
                avatar: 1,
                totalProducts: 1,
                isActive: 1,
            }
        });
        // step 7: pagniation
        const staff = await User.aggregate([
            ...pipeline,
            { $skip: skip },
            { $limit: pageSize }
        ]);
        // tinh tong so luong de tinh totalPages
        const totalStaffs = await User.aggregate([
            ...pipeline,
            { $count: "total" }
        ]);
        // console.log("total", totalStaffs); // tra ve 1 mang
        const total = totalStaffs.length > 0 ? totalStaffs[0].total : 0;
        const totalPages = Math.ceil(total / pageSize);
        // test hàm pipeline
        //console.log("Pipeline after match:", JSON.stringify(pipeline, null, 2));
        res.status(200).json({
            success: true,
            data: staff,
            pagination: {
                page: currentPage,
                limit: pageSize,
                total,
                totalPages
            }
        });

    } catch (error) {
        console.error("Error fetching staff users:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi khi lấy danh sách nhân viên"
        });
    }
}
const getUserAdminController = async (req, res) => {
    try {
        const {
            search,
            sort,
            page = 1,
            limit = 9,
        } = req.query;
        const currentPage = Number(page);
        const pageSize = Number(limit);
        const skip = (currentPage - 1) * pageSize;
        const admin = await User.find({ role: "admin", userName: { $regex: search || '', $options: 'i' } })
            .select("-password")
            .sort(sort === "newest" ? { createdAt: -1 } : { createdAt: 1 })
            .skip(skip)
            .limit(pageSize);
        const total = await User.countDocuments({ role: "admin", userName: { $regex: search || '', $options: 'i' } });
        const totalPages = Math.ceil(total / pageSize);
        res.status(200).json({
            success: true,
            data: admin,
            pagination: {
                page: currentPage,
                limit: pageSize,
                total,
                totalPages
            }
        });
    } catch (error) {
        console.error("Error fetching admin users:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi khi lấy danh sách admin"
        });
    }
}
module.exports = {
    getUsersCustomerController,
    getNumberOfUser,
    getUserSaleController,
    getUserStaffController,
    getUserAdminController
};
