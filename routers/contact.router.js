const express = require('express');
const router = express.Router();
const ContactController = require('../controllers/contact.controller');

router.get('/', ContactController.findAllContacts);
router.post('/', ContactController.createContact);
router.put('/:id', ContactController.updateContact);
router.patch('/:id/archive', ContactController.archiveContact);
router.get('/:id', ContactController.findContactById);
router.put('/:id/localisation', ContactController.updateContactLocalisation);

module.exports = router;