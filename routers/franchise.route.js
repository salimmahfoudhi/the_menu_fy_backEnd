const express = require('express');
const multer = require('multer');
const router = express.Router();
const franchiseController = require('../controllers/franchise.controller');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./uploads/Franchise");
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  });
  const upload = multer({ storage: storage });

router.post('/updateFranchiseCRM/:franchiseId', upload.single("logo"), franchiseController.updateFranchiseCRM);

// Other franchise routes
router.post('/', franchiseController.createFranchise);
router.get('/', franchiseController.getAllFranchises);
router.get('/:id', franchiseController.getFranchiseById);
router.put('/:id', franchiseController.updateFranchise);
router.delete('/:id', franchiseController.deleteFranchise);
router.get('/restaurants/:franchiseId/', franchiseController.getRestaurantsByFranchiseId);
router.get('/logo/:franchiseId', franchiseController.getFranchiseLogoById);
router.get('/af/af', franchiseController.getArchivedFranchises);
router.get('/menu/:id', franchiseController.retrieveMenuIdByFranchiseId);


module.exports = router;
