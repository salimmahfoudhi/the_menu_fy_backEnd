const express = require('express');
const router = express.Router();
const cookieParser = require("cookie-parser");
const helpController = require('../../controllers/sprint2/help_request.controller');
router.use(cookieParser());

router.post('/addhelp', helpController.addNewHelp);
router.post('/addhelpweb/:userId', helpController.addNewHelpweb);
router.get('/getHelpById/:id', helpController.getHelpById);
router.get('/getHelpList', helpController.getHelpList);
router.put('/updateHelpp/:id', helpController.updateHelp);
router.get('/getHelpListFalse', helpController.getHelpListFalse);
router.put('/updateHelp/:id', helpController.updateHelpRequest);
router.post('/insatisfaction/help/request', helpController.insatisfactionHelpRequest);

module.exports = router;