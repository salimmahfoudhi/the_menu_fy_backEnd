const express = require('express');
const router = express.Router();
const socialnetController = require('../controllers/socialnet.controller');


router.post('/', socialnetController.createSocialnet);

router.get('/', socialnetController.getAllSocialnets);

router.put('/:id', socialnetController.updateSocialnet);
router.put('/:id/archive', socialnetController.archiveSocialnet);

router.put('/:id/toggle', socialnetController.toggleSocialnet);

module.exports = router;
