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
        console.log("Query params:", search);
        const currentPage = Number(page);
        const pageSize = Number(limit);
        const skip = (currentPage - 1) * pageSize;

        // 1. Khởi tạo Pipeline
        let pipeline = [];

        // 2. Bước Match đầu tiên: Lọc User theo Role, Status và Search
        let userMatch = { role: "customer" }; // Chỉ lấy khách hàng
        // isActive: true/false hoặc all (mặc định là all)
        if (status !== 'all') {

            userMatch.status = status;
        }

        if (search) {
            userMatch.fullName = {
                $regex: search,
                $options: "i"
            };
            //         userMatch.$or = [
            //     { name: { $regex: search, $options: "i" } },
            //     { email: { $regex: search, $options: "i" } },
            //     { phone: { $regex: search, $options: "i" } }
            // ];
        }
        pipeline.push({ $match: userMatch });

        // 3. Lookup: Kết nối với bảng orders
        pipeline.push({
            $lookup: {
                from: "orders", // Tên collection trong MongoDB (thường là số nhiều)
                localField: "_id",
                foreignField: "customerId",
                as: "orderHistory"
            }
        });

        // 4. AddFields: Tính toán sumOrders và totalSpent
        pipeline.push({
            $addFields: {
                sumOrders: { $size: "$orderHistory" },
                totalSpent: { $sum: "$orderHistory.finalAmount" }
            }
        });

        // 5. Match sau khi tính toán (Lọc theo Range Price và Range Orders)
        let statsMatch = {};
        if (fromPrice || toPrice) {
            statsMatch.totalSpent = {};
            if (fromPrice) statsMatch.totalSpent.$gte = Number(fromPrice);
            if (toPrice) statsMatch.totalSpent.$lte = Number(toPrice);
        }

        if (fromOrders || toOrders) {
            statsMatch.sumOrders = {};
            if (fromOrders) statsMatch.sumOrders.$gte = Number(fromOrders);
            if (toOrders) statsMatch.sumOrders.$lte = Number(toOrders);
        }

        if (Object.keys(statsMatch).length > 0) {
            pipeline.push({ $match: statsMatch });
        }

        // 6. Sort
        let sortOption = { createdAt: -1 };
        if (sort === "spent_desc") sortOption = { totalSpent: -1 };
        if (sort === "spent_asc") sortOption = { totalSpent: 1 };
        if (sort === "orders_desc") sortOption = { sumOrders: -1 };

        pipeline.push({ $sort: sortOption });

        // 7. Project: Chỉ lấy các trường cần thiết để giảm tải dữ liệu
        pipeline.push({
            $project: {
                password: 0, // Ẩn mật khẩu
                orderHistory: 0 // Ẩn mảng thô sau khi đã tính toán xong
            }
        });

        // 8. Lấy danh sách khách hàng (Có phân trang)
        const customers = await User.aggregate([
            ...pipeline,
            { $skip: skip },
            { $limit: pageSize }
        ]);

        // test qurry
        console.log("Pipeline:", JSON.stringify(pipeline, null, 2));
        // 9. Lấy tổng số lượng (Để tính totalPages)
        // Chúng ta chạy lại pipeline nhưng chỉ để đếm số bản ghi thỏa mãn điều kiện
        const countResult = await User.aggregate([
            ...pipeline,
            { $count: "total" }
        ]);

        const total = countResult.length > 0 ? countResult[0].total : 0;

        // 10. Response
        res.status(200).json({
            success: true,
            data: customers,
            pagination: {
                total,
                page: currentPage,
                limit: pageSize,
                totalPages: Math.ceil(total / pageSize),
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

module.exports = {
    getUsersCustomerController,
};