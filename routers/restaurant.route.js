const express = require('express');
const router = express.Router();
const restaurantController = require ("../controllers/restaurant.controller")
//const multer = require('multer');
const MIME_TYPES = { //définir les types des images a accepter
    'image/jpg': 'jpg',
    'image/jpeg': 'jpeg',
    'image/png': 'png'
  };
  /*
  const storage = multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, './uploads/user/'); //on va stocker les files dans uploads/user
    },
    filename: (req, file, callback) => {
      const name = file.originalname.split(' ').join('_');
      const extension = MIME_TYPES[file.mimetype]; 
      callback(null, name + Date.now() + '.' + extension);
    }
  });


  const storageEstablishment = multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, './uploads/Establishment/'); // Remove the space after 'Establishment'
    },
    filename: (req, file, callback) => {
      const name = file.originalname.split(' ').join('_');
      const extension = MIME_TYPES[file.mimetype];
      callback(null, name + Date.now() + '.' + extension);
    }
  });
  
 
  const uploadEstablishment  = multer({storage:storageEstablishment}).single("logo"); 
  const uploadEstablishmentImages  = multer({storage:storageEstablishment}).single("images"); 
*/

const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./uploads/Establishment");
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  });
  
// Multer upload middleware for logos
const upload = multer({ storage: storage }).fields([
  { name: 'logo', maxCount: 1 },
  { name: 'images', maxCount: 1 }
]);
router.get ('/retrieve/:restoId' , restaurantController.getRestoData);
router.get ('/retrieveAll' , restaurantController.retrieveAll);
//router.post('/updateRestaurantCRM/:restaurantId',uploadEstablishment,uploadEstablishmentImages, restaurantController.updateRestaurantCRM);
router.post('/updateRestaurantCRM/:restaurantId',upload, restaurantController.updateRestaurantCRM);
router.get('/name/:nameRes', restaurantController.getRestaurantByName);
router.get ('/getArchivedFieldCRMPagination/:field' , restaurantController.getArchivedFieldCRMPagination)
router.get ('/unArchiveCrmById/:idCrm/:field' , restaurantController.unArchiveCrmById)
router.get ('/getTaxeCanada' , restaurantController.getTaxeCanada);
router.get ('/getAllTaxe' , restaurantController.getAllTaxe);
router.get ('/findRestaurantByUserId/:idUser' , restaurantController.findRestaurantByUserId);
router.get ('/getAllPaiementForRestaurant' , restaurantController.getAllPaiementForRestaurant);


//////////////web////////
router.get('/search', restaurantController.searchRestaurants);  
router.get('/restaurants/status/:status', restaurantController.getRestaurantsByStatus);

module.exports = router;

