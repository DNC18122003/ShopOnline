// import 
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// controller for login
 const loginController = async (req, res) => {
    console.log("Hello");
    const { email, password } = req.body;
    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check password
        if (user.password !== password) {
            return res.status(401).json({ message: 'Invalid password' });
        }
        // Create jwt token 
        const token = jwt.sign({
            id: user._id,
            role: user.role
        }, process.env.JWT_SECRET, { expiresIn: '24h' });
        // Set token in cookie
        res.cookie('accessToken', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 
        })

        return res.status(200).json({ message: 'Login successful' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};
// controller for login with google 
 const loginWithGoogleController = async (req, res) => {};
// controller for register
 const registerController = async (req, res) => {};
 module.exports = { loginController, loginWithGoogleController, registerController };   