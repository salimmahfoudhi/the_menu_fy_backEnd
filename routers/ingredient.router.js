const express = require('express');
const router = express.Router();
const multer = require('multer');
const _ = require('../controllers/ingredient.controller');

const path = require("path");
const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/svg": "svg",
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    const destinationPath = path.join(__dirname, "../uploads/ingredient");
    callback(null, destinationPath);
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(" ").join("_");
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name);
  },
});

const upload = multer({ storage: storage });

router.post ('/add/:productFK', _.addNew);
router.post ('/create',upload.single("img"), _.createNew);

router.get ('/retrieve/:productFK' , _.retrieveAll);
router.get ('/retrieveAll' , _.retrieve);
router.get ('/retrieve/group_by/type' , _.retrieveGroupByType);
router.get ('/find/item/:id', _.retrieveById);
router.delete ('/delete/:id', _.deleteById);
router.put ('/update/:id', _.updateById);

router.put ('/show/:id', _.showById);
router.put ('/hide/:id', _.hideById );

router.get ('/retrieve/disponible/ingredient/by/Product/:productFK' , _.diponibleIngredientByProduct);
router.post('/retrieveByProducts', _.retrieveByProducts);

module.exports = router;

