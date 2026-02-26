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

const updateProfileController = async (req, res) => {
    console.log("Hello")
    try {
        const userId = req.user._id;
        const { fullName, phoneNumber } = req.body;
        console.log("data: ", fullName, phoneNumber)
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.fullName = fullName;
        user.phone = phoneNumber;
        const resUp = await user.save();
        console.log("Updated user:", resUp);
        res.json({ success: true, message: "Profile updated successfully" });
    } catch (error) {
        console.error("Error updating profile:", error);
        return res.status(500).json({ message: "Error updating profile" });
    }
};

module.exports = { getProfileController };