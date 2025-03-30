const express = require('express');
const router = express.Router();
const whyChooseUsController = require('../../controllers/2024/sprint1/whyChooseUs.controller');
const multer = require('multer');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpeg',
  'image/png': 'png'
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, './uploads/aboutUs'); // Répertoire de destination pour les téléchargements d'images
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_');
    const extension = file.mimetype.split('/')[1];
    callback(null, name + '_' + Date.now() + '.' + extension); // Nom du fichier téléchargé
  }
});

const upload = multer({ storage: storage });

router.post('/whychooseus', upload.single('image'), whyChooseUsController.uploadImage);
router.post ('/whychooseuss', whyChooseUsController.createWhyChooseUs);
router.get('/whychooseus', whyChooseUsController.getWhyChooseUs);
router.put('/whychooseus/:id', whyChooseUsController.updateWhyChooseUs);

module.exports = router;
