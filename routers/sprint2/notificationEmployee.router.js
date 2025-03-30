const express = require('express');
const router = express.Router();
const cookieParser = require("cookie-parser");
const notificationEmployee = require('../../controllers/sprint2/notificationEmployee.controller')

router.use(cookieParser());

router.get('/getAll', notificationEmployee.getAllNotifications);
router.delete('/deleteNotification', notificationEmployee.deleteEveryNotification)

module.exports = router;