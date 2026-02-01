const User = require("../../models/User");

const getProfileController = async (req, res) => {
    try {
        const userId = req.user._id; // Lấy userId từ req.user do passport đã gán
        console.log("Fetching profile for userId:", userId);
        const user = await User.findById(userId)
            .select("-password") // Loại bỏ trường password khỏi kết quả
            .lean();
        res.json({ success: true, myProfile: user });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return res.status(500).json({ message: "Error fetching user profile" });
    }
}

module.exports = { getProfileController };