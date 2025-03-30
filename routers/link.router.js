const express = require('express');
const router = express.Router();
const linkController = require('../controllers/link.controller');


router.post('/', linkController.createLink);

router.get('/', linkController.getAllLinks);


router.put('/:id', linkController.updateLink);


router.put('/archive/:id', linkController.archiveLink);


router.put('/toggle/:id', linkController.toggleLink);
router.get('/active-links', linkController.getActiveLinks);

module.exports = router;