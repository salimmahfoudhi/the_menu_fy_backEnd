const express = require('express');
const router = express.Router();
const multer = require('multer');


const _ = require('../controllers/category.controller');
const MIME_TYPES = {
    'image/jpg':'jpg',
    'image/jpeg':'jpeg',
    'image/png':'png',
    'image/svg':'svg'
};

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
      // Spécifiez le chemin où vous souhaitez enregistrer les fichiers téléchargés
      callback(null, './uploads/category'); // Assurez-vous que le chemin est correct
    },
    filename: (req, file, callback) => {
      // Définissez le nom du fichier comme vous le souhaitez (par exemple, un nom unique)
      callback(null, Date.now() + '-' + file.originalname);
    },
  });
  
  const upload = multer({ storage: storage });

router.post ('/add/:menu', upload.single("photo"), _.addNew);
router.post ('/create', upload.single("photo"), _.createNew);
router.get ('/fetch/enable/:menu', _.retrieveWhereVisibilityIsEqualToENABLE);
router.get ('/fetch/disable/:menu', _.retrieveWhereVisibilityIsEqualToDISABLE);
router.get ('/find/item/:id', _.retrieveById);
router.get('/retrieveall',_.retrieveAll);
router.delete ('/delete/:id', _.deleteById);
router.put ('/update/:id', upload.single("photo"), _.updateById);
router.put ('/update/enable/visibility/:id', _.enableCategoryById);
router.put ('/update/disable/visibility/:id', _.disableCategoryById);
router.put('/update/photo/:id',upload.single("photo"),_.updatePhotoById);
router.get('/find/item/by/menu/:menu', _.retrieveByMenuId);

router.post ('/createCategoryForRestaurant', upload.single("photo"), _.createCategoryForRestaurant);
router.get('/retrieveRestaurantByIdUser/:id',_.retrieveRestaurantByIdUser);
router.get('/find/item/by/menus/:menu', _.retrieveByMenuIds);
module.exports = router;

