const express = require('express');
const router = express.Router();
const multer = require("multer");
const itemController = require('../controllers/item.controller');
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
router.post ('/addItem/:ingredientFK', itemController.addNewItem);
router.post ('/create',upload.single("img"), itemController.createNew);

router.get ('/retrieve/visible/item/by/ingredient/:ingredient' , itemController.getVisibleItemByIngredientId);
router.get ('/retrieveAll' , itemController.getAllItems);
router.get('/find/:id',itemController.getItemById);
router.put ('/updateItem/:itemId', itemController.updateItem);
router.delete ('/deleteItem/:itemId', itemController.deleteItem);
router.put ('/hideItem/:id' , itemController.hideItem);
router.put ('/enableItem/:id', itemController.enableItem);
router.post('/retrieveByIngredientFK', itemController.getItemsByIngredientFK);


module.exports = router;

