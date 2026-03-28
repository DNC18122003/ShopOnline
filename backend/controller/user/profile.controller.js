const User = require("../../models/User");
const Employee = require("../../models/Employee");
const { uploadToCloudinary } = require("../../middleware/upload");
const getProfileController = async (req, res) => {
    try {
        const userId = req.user._id; // Lấy userId từ req.user do passport đã gán
        //console.log("Fetching profile for userId:", userId);
        const user = await User.findById(userId)
            .select("-password") // Loại bỏ trường password khỏi kết quả
            .lean();
        res.json({ success: true, myProfile: user });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return res.status(500).json({ message: "Error fetching user profile" });
    }
};
const getProfileEmployeeController = async (req, res) => {
    try {
        const userId = req.user._id; // Lấy userId từ req.user do passport đã gán
        const employee = await Employee.aggregate([
            { $match: { userId: userId } },
            {
                $lookup: {
                    from: "departments",
                    localField: "role",
                    foreignField: "_id",
                    as: "roleInfo",
                },

            },
            {
                $addFields: {
                    role: { $arrayElemAt: ["$roleInfo", 0] },
                },
            },
            {
                $project: {
                    roleInfo: 0
                }
            },
        ]);
        res.json({ success: true, myProfile: employee[0] });
    } catch (error) {
        console.error("Error fetching employee profile:", error);
        return res.status(500).json({ message: "Lỗi lấy thông tin nhân viên hệ thống !" });
    }
};

const updateProfileController = async (req, res) => {
    //console.log("Hello")
    try {
        const userId = req.user._id;
        const { fullName, phone, address } = req.body;
        // validate data
        const fullNameParsed = fullName.trim();
        const phoneParsed = phone.trim();
        const addressParsed = {
            street: address.street.trim(),
            ward: address.ward.trim(),
            province: address.province.trim(),
        };
        //console.log("data: ", fullNameParsed, phoneParsed, addressParsed);
        //console.log("fN", fullNameParsed, "p", phoneParsed, "a", addressParsed);
        const user = await User.findById(userId);
        const employee = await Employee.findById(userId);
        // console.log("Current user data:", user);
        // console.log("Current employee data:", employee);
        if (!user && !employee) {
            return res.status(404).json({ message: "Không tìm thấy người dùng !" });
        }


        if (user) {

            user.fullName = fullNameParsed;
            user.address = addressParsed;
            user.phone = phoneParsed;
            console.log("Updated user data:", user);
            const resUp = await user.save();
        }

        if (employee) {
            employee.fullName = fullNameParsed;
            employee.address = addressParsed;
            employee.phone = phoneParsed;
            console.log("Updated employee data:", employee);
            const resUp = await employee.save();
            //console.log("Updated employee data:", resUp);
        }
        //console.log("Updated user:", resUp);
        res.json({
            success: true,
            message: "Cập nhật thông tin cá nhân thành công !!",
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        return res.status(500).json({ message: "Error updating profile" });
    }
};

const updateAvatarController = async (req, res) => {

    console.log("================hi===================");
    try {
        const userId = req.user._id;
        console.log("File nhận được:", req.file); // <== Thêm dòng này để kiểm tra
        console.log("Body nhận được:", req.body);

        // 1. Kiểm tra xem file có tồn tại không (do multer xử lý)
        if (!req.file) {
            return res.status(400).json({ message: "Vui lòng chọn một file ảnh" });
        }

        // 2. Upload file lên Cloudinary bằng hàm bạn đã viết
        // Vì uploadToCloudinary nhận một mảng, ta truyền [req.file]
        const uploadResults = await uploadToCloudinary([req.file], "user_avatars/");
        console.log("Kết quả upload từ Cloudinary:", uploadResults);
        // Lấy URL từ kết quả trả về
        const newAvatarUrl = uploadResults[0];
        console.log("URL ảnh mới sau khi upload:", newAvatarUrl);
        // 3. Cập nhật vào cơ sở dữ liệu
        const user = await User.findById(userId);
        const employee = await Employee.findById(userId);
        if (!user && !employee) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }

        if (user) {
            user.avatar = newAvatarUrl;
            await user.save();
        }

        if (employee) {
            employee.avatar = newAvatarUrl;
            await employee.save();
        }

        // 4. Trả về kết quả cho Frontend
        res.json({
            success: true,
            message: "Cập nhật ảnh đại diện thành công",
            avatar: newAvatarUrl // Gửi lại URL mới để FE cập nhật UI
        });

    } catch (error) {
        console.error("Error updating avatar:", error);
        return res.status(500).json({ message: "Lỗi hệ thống khi cập nhật ảnh" });
    }
};

module.exports = {
    getProfileController,
    updateProfileController,
    updateAvatarController,
    getProfileEmployeeController
};
