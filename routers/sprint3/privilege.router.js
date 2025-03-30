const express = require('express');
const router = express.Router();
const privilegeController = require ("../../controllers/sprint3/privilege.controller")

router.get ('/retrieveByUser' , privilegeController.getPrivilegeByUser);

module.exports = router;
