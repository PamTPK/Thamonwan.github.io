const multer = require('multer');
const path = require("path");
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/upload/'); // Specify the directory where uploaded files will be stored
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

// Initialize upload
const upload = multer({ storage: storage, limits: { fieldSize: 100 * 1000 } }).single("filetoupload");

module.exports = (req, res, next) => {
    upload(req, res, (err) => {
        if (err) {
            console.error('Multer Error:', err);
            return res.status(500).json({ error: 'Error uploading file' });
        }

        console.log('Uploaded File:', req.file);

        next();
    });
};