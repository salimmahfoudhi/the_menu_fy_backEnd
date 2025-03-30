const express = require('express');
const router = express.Router();
const cookieParser = require("cookie-parser");
const RequestController = require('../controllers/request.controller');

router.use(cookieParser());

router.post('/requestJoin', RequestController.requestJoin);
router.get('/getRequest', RequestController.getRequest);
router.post('/refuseRequest', RequestController.refuseRequest);

module.exports = router;