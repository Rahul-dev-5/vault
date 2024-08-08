const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const upload = require('../config/fileConfig');
const verifyJWT = require('../middleware/auth');

// File routes
router.post('/upload', verifyJWT, upload.single('file'), fileController.uploadFile);
router.get('/files', verifyJWT, fileController.getAllFiles);
router.get('/files/:filename', verifyJWT, fileController.getFileByName);
router.get('/file/:filename', verifyJWT, fileController.downloadFile);
router.delete('/files/:id', verifyJWT, fileController.deleteFile);

module.exports = router;
