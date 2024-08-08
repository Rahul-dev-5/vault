// app.js

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const GridFSBucket = require('mongodb').GridFSBucket;
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

dotenv.config({ path: '../.env' });

const app = express();
const fileRoutes = require('./routes/fileRoutes');
const userRoutes = require('./routes/userRouter');
const verifyJWT = require('./middleware/auth');

// Middleware
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Mongo URI
const mongoURI = process.env.MONGO_URL || 'mongodb://localhost:27017/mongouploads';

// Create mongo connection
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

const conn = mongoose.connection;

conn.on('connected', () => {
    console.log('Mongoose connected to the database');
});

conn.on('error', (err) => {
    console.error('Mongoose connection error:', err);
});

conn.on('disconnected', () => {
    console.log('Mongoose disconnected');
});

// Init GridFSBucket
let gfs;
conn.once('open', () => {
    gfs = new GridFSBucket(conn.db, { bucketName: 'uploads' });

    // Import controller here and pass `gfs`
    const fileController = require('./controllers/fileController');
    fileController.setGfs(gfs);

    // Use routes
    app.use('/users', userRoutes);
    app.use('/files', fileRoutes);

    // Root route
    app.get('/', (req, res) => {
        res.send('Welcome to the API');
    });

    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`Server started on port ${port}`));
});
