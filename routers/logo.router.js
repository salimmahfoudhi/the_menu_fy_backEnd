const express = require('express');
const router = express.Router();
const logoController = require('../controllers/logo.controller');
const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./uploads/logos");
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  });
  
  const upload = multer({ storage: storage });
  
  router.post("/", upload.single("logo"), logoController.createLogo);

router.get('/', logoController.getAllLogos);

router.put('/:id', upload.single("img"), logoController.updateLogo);

router.put('/archive/:id', logoController.archiveLogo);
router.get('/:name', logoController.getLogoByName);
module.exports = router;