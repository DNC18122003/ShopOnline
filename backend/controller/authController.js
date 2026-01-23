// import 
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const hashPassword = require('../utils/hash-password');
// controller for login
 const loginController = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Check password using bcrypt.compare
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
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
        // set data use to response
        const userResponse = {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            // Thêm các field khác nếu cần
        };

        return res.status(200).json({ 
            message: 'Login successful',
            user: userResponse,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};
// controller for register
const registerController = async (req, res) => {
    const { userName, email, password } = req.body; 
    console.log('Register controller called in backend:', userName, email, password);
    // validate data in backend
    if (!userName || !email || !password) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    try {
        // check emai exist
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }
        // check userName exist
        const existingUserName = await User.findOne({ userName })
        if (existingUserName) {
            return res.status(400).json({ message: 'User name already in use' });
        }
        //hash password
        const hash_Password = await hashPassword(password);
        const newUser = new User({
            userName,
            email,
            password: hash_Password
        });
        //create new user
        await newUser.save();
        return res.status(201).json({ message: 'User registered successfully', user: {
            id: newUser._id,
            userName: newUser.userName,
            email: newUser.email
        }
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Server error' });
    }
};
// controller for login with google 
 const loginWithGoogleController = async (req, res) => {};
 module.exports = { loginController, loginWithGoogleController, registerController };   