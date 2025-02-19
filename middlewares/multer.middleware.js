import multer from 'multer';

// Set up storage for multer (you can customize the storage location or filename)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Folder to save uploaded files
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Customize filename if needed
    },
});

// Initialize multer with storage options
export const upload = multer({ storage: storage });