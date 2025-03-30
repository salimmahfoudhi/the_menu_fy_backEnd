// routes/privacyPolicyRoute.js
const express = require('express');
const router = express.Router();
const privacyPolicyController = require('../../controllers/2024/sprint1/privacypolicy.contoller');

// Route pour récupérer les conditions de confidentialité
router.get('/', privacyPolicyController.getPrivacyPolicy);

// Route pour accepter les conditions de confidentialité
router.post('/accept', privacyPolicyController.acceptPrivacyPolicy);
router.post('/', privacyPolicyController.createPrivacyPolicy);
router.put('/privacyPolicy/:id', privacyPolicyController.updatePrivacyPolicy);

module.exports = router;