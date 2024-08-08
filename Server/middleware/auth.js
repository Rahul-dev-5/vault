const asyncErrorHandler = require('../utils/asyncErrorHandler');
const UserModel = require('../models/userModel');
const jwt = require('jsonwebtoken');

const verifyJWT = asyncErrorHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized. No token provided.' });
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await UserModel.findById(decodedToken?._id).select("-password");

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized. User not found.' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized. Invalid token.' });
    }
});

module.exports = verifyJWT;
