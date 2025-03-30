const NotificationEmployee = require('../../models/sprint2/notificationEmployee.model');
const jwt_decode = require("jwt-decode");
const cron = require('node-cron');
const moment = require('moment');

const notificationEmployeeController = {
 
    getAllNotifications: async (req, res) => {
        try {
            const notificationData = await NotificationEmployee.find({ payMethod: { $ne: "" } })
                .sort({ date: -1 })
                .populate({
                    path: 'orderFK',
                    populate: [{
                        path: 'restaurantFK'
                    }]
                })
                .populate('helpRequestFK')
            res.send(notificationData);
        } catch (err) {
            console.error('Une exception s\'est produite :', err);
            res.status(500).send('Une erreur est survenue lors de la récupération des notifications.');
        }
    },

    deleteEveryNotification: async (req, res) => {
        cron.schedule('* * * * * *', async () => {
            try {
                const currentDate = moment();
                const notifications = await NotificationEmployee.find({}, 'date');

                for (const notification of notifications) {
                    const diffInHours = currentDate.diff(notification.date, 'seconds');
              
                    if (diffInHours >= 72) {
                      await NotificationEmployee.findByIdAndDelete(notification._id);
                    }
                  }
            } catch (error) {
                console.error('Error deleting notifications:', error);
            }
        })
       

    },
};

module.exports = notificationEmployeeController;