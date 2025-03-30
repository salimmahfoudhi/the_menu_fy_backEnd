const express = require('express');
const router = express.Router();
const cookieParser = require("cookie-parser");
const notificationOrder = require('../../controllers/sprint2/notification.controller')

router.use(cookieParser());

router.get('/get/by/id/:id', notificationOrder.getNotificationById);
router.get('/get/all/by/user', notificationOrder.getAllNotifByUser);
router.delete('/clear/notifications/by/user', notificationOrder.deleteAllNotificationsByUser);
router.delete('/delete/notification/cron', notificationOrder.deleteEveryNotification);
router.get('/notifications/:userId', notificationOrder.getAllNotifByUserweb);
router.get('/getAllNotificationByResto/:userId', notificationOrder.getAllNotificationByResto);



module.exports = router;