const Notification = require('../../models/sprint2/notification.model');
const jwt_decode = require("jwt-decode");
const cron = require('node-cron');
const moment = require('moment');
const User = require ("../../models/user.model");
const notificationController = {
   
    getNotificationById: async (req, res) => {
        try {
            const id = req.params.id;
            await Notification.findById(id).populate('orderFK').populate('restaurantFK')
                .then((data) => {
                    res.json(data);
                })
                .catch((error) => {
                    res.status(400).json({ message: error });
                });
        } catch (error) {
            res.status(500).json({ message: "Internal Server Error", error });
        }
    },

    getAllNotifByUser: async (req, res) => {
        try {
            const tokenLogin = req.cookies.tokenLogin;
            const decodeTokenLogin = jwt_decode(tokenLogin);
            const idUser = decodeTokenLogin.id;

            const notificationData = await Notification.find({ userConcerned: idUser }).sort({ createdAt: -1 })
                .populate({
                    path: 'orderFK',
                    populate: [{
                        path: 'restaurantFK'
                    }]
                })
            res.send(notificationData);
        } catch (err) {
            console.error('Une exception s\'est produite :', err);
            res.status(500).send('Une erreur est survenue lors de la récupération des notifications.');
        }
    },

    deleteAllNotificationsByUser: async (req, res) => {
        try {
            const tokenLogin = req.cookies.tokenLogin;
            const decodeTokenLogin = jwt_decode(tokenLogin);
            const idUser = decodeTokenLogin.id;

            await Notification.find({ userConcerned: idUser }).deleteMany();
            res.json({ msg: "No more notification" });
        } catch (error) {
            res.status(500).json({ message: "Internal Server Error" + error });
        }
    },

    deleteEveryNotification: async (req, res) => {
        cron.schedule('* * * * * *', async () => {
            try {
                const currentDate = moment();
                const notifications = await Notification.find({}, 'date');

                for (const notification of notifications) {
                    const diffInHours = currentDate.diff(notification.date, 'hours');
              
                    if (diffInHours >= 24) {
                      await Notification.findByIdAndDelete(notification._id);
                      console.log('New order deleted');
                    }
                }
            } catch (error) {
                console.error('Error deleting notifications:', error);
            }
        })
       

    },

    
    getAllNotificationByResto: async (req, res) => {
        try {
            const { userId } = req.params; // Get user ID from params
    
            const userExists = await User.findById(userId);
            if (!userExists) {
                return res.status(404).json({ message: 'User not found' });
            }
          //  let query = { }; 
            //query.userConcerned = userId; 

            const notificationData = await Notification.find({ userConcerned:userId }).sort({ createdAt: -1 })
                .populate({
                    path: 'userSended',                   
                });
             //   console.log('id '+userId)

              //  console.log('data '+JSON.stringify(notificationData))

            res.send(notificationData);
        } catch (err) {
            console.error('An error occurred:', err);
            res.status(500).send('An error occurred while retrieving notifications.');
        }
    },
    getAllNotifByUserweb: async (req, res) => {
        try {
            const idUser = req.params.userId;
    
            const notificationData = await Notification.find({ userConcerned: idUser }).sort({ createdAt: -1 })
                .populate({
                    path: 'orderFK',
                    populate: [{
                        path: 'restaurantFK'
                    }]
                });
            res.send(notificationData);
        } catch (err) {
            console.error('Une exception s\'est produite :', err);
            res.status(500).send('Une erreur est survenue lors de la récupération des notifications.');
        }
    },
    
};

module.exports = notificationController;