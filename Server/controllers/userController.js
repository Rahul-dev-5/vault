// controllers/userController.js

const asyncErrorHandler = require('../utils/asyncErrorHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const UserModel = require('../models/userModel');

// Generate a JWT token for the user
const generateToken = async (userId) => {
    try {
        const user = await UserModel.findById(userId);
        const accessToken = user.generateAccessToken();
        return { accessToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access token");
    }
};

// Register a new user
const registerUser = asyncErrorHandler(async (req, res) => {
    const { username, email, fullName, password } = req.body;

    if ([username, email, fullName, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await UserModel.findOne({
        $or: [{ username }, { email }]
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    const user = await UserModel.create({
        fullName,
        email,
        password,
        username
    });

    const createdUser = await UserModel.findById(user._id).select("-password");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(new ApiResponse(201, createdUser, "User registered successfully"));
});

// Login a user
const loginUser = asyncErrorHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(404, "Invalid password");
    }

    const { accessToken } = await generateToken(user._id);

    const options = { httpOnly: true, secure: true };

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .json(new ApiResponse(200, { user, accessToken }, "User logged in successfully"));
});

// Logout a user
const logoutUser = asyncErrorHandler(async (req, res) => {
    const options = { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production', // Set to true only in production
        sameSite: 'None' // Add if you are using cookies across different sites
    };

    // Debugging output
    console.log("Clearing cookie with options:", options);

    return res.status(200)
        .clearCookie("accessToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});
// Change a user's password
const changePassword = asyncErrorHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await UserModel.findById(req.user?._id);

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"));
});

// Update account details
const updateAccountDetails = asyncErrorHandler(async (req, res) => {
    const { fullName, email } = req.body;

    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await UserModel.findByIdAndUpdate(
        req.user?._id,
        { $set: { fullName, email } },
        { new: true }
    ).select("-password");

    return res.status(200)
        .json(new ApiResponse(200, user, "Account details updated successfully"));
});

// Render the login page


// Redirect based on authentication status


module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    changePassword,
    updateAccountDetails,
};
