//controllers/filecontroller
const mongoose = require('mongoose');
let gfs;

exports.setGfs = (gridFSBucket) => {
  gfs = gridFSBucket;
};

exports.getFiles = (req, res) => {
  if (!gfs) {
    return res.status(500).json({ err: 'GridFSBucket not initialized' });
  }
  gfs.find().toArray((err, files) => {
    if (err) {
      return res.status(500).json({ err: 'Error retrieving files' });
    }
    if (!files || files.length === 0) {
      return res.status(404).json({ message: 'No files found' });
      // res.render('index', { files: false });
    } else {
      files.map(file => {
        file.isImage = file.contentType.startsWith('image/');
        file.isText = file.contentType.startsWith('text/');
        file.isPDF = file.contentType === 'application/pdf';
        file.isOther = !file.isImage && !file.isText && !file.isPDF;
      });
      return res.json(files);
      // res.render('index', { files: files });
    }
  });
};

exports.uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.status(200).json({ message: 'File uploaded successfully', file: req.file });
};

exports.getAllFiles = (req, res) => {
  if (!gfs) {
    return res.status(500).json({ err: 'GridFSBucket not initialized' });
  }
  gfs.find().toArray((err, files) => {
    if (err) {
      return res.status(500).json({ err: 'Error retrieving files' });
    }
    if (!files || files.length === 0) {
      return res.status(404).json({ err: 'No files exist' });
    }
    return res.json(files);
  });
};

exports.getFileByName = (req, res) => {
  if (!gfs) {
    return res.status(500).json({ err: 'GridFSBucket not initialized' });
  }
  gfs.find({ filename: req.params.filename }).toArray((err, file) => {
    if (err) {
      return res.status(500).json({ err: 'Error retrieving file' });
    }
    if (!file || file.length === 0) {
      return res.status(404).json({ err: 'No file exists' });
    }
    return res.json(file[0]);
  });
};

exports.downloadFile = (req, res) => {
  if (!gfs) {
    return res.status(500).json({ err: 'GridFSBucket not initialized' });
  }
  gfs.find({ filename: req.params.filename }).toArray((err, file) => {
    if (err) {
      return res.status(500).json({ err: 'Error retrieving file' });
    }
    if (!file || file.length === 0) {
      return res.status(404).json({ err: 'No file exists' });
    }

    const readstream = gfs.openDownloadStreamByName(file[0].filename);
    readstream.on('error', (error) => {
      res.status(500).json({ err: 'Error reading file' });
    });
    readstream.pipe(res);
  });
};

exports.deleteFile = (req, res) => {
  if (!gfs) {
    return res.status(500).json({ err: 'GridFSBucket not initialized' });
  }
  gfs.delete(new mongoose.Types.ObjectId(req.params.id), (err) => {
    if (err) {
      return res.status(404).json({ err: 'Error deleting file' });
    }
    return res.status(200).json({ message: 'File deleted' });
  });
};
