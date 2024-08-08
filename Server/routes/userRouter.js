// router/userRouter.js

const express = require('express');
const { 
    registerUser, 
    loginUser, 
    logoutUser, 
    updateAccountDetails, 
    changePassword, 

} = require('../controllers/userController');
const verifyJWT = require('../middleware/auth');
const router = express.Router();

// Routes for rendering pages
// router.get('/login', renderLoginPage);
// router.get('/register', renderRegisterPage);

// Routes for handling user actions
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', verifyJWT, logoutUser);
router.patch('/update-profile', verifyJWT, updateAccountDetails);
router.post('/change-password', verifyJWT, changePassword);

module.exports = router;
