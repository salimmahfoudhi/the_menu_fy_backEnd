const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const _ = require("../controllers/gifproduct.controller");

const MIME_TYPES = {
  "image/svg+xml": "svg",
  "image/gif": "gif"
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    const destinationPath = path.join(__dirname, "../uploads/product");
    callback(null, destinationPath);
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(" ").join("_");
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name);
  },
});

const upload = multer({ storage: storage });

router.post('/create/:productFK', upload.single("photo"), _.add);
router.get('/retrieve/:productFK', _.retrieveByProductFK);
router.delete('/delete/:id', _.deleteById);

module.exports = router;
