const Help_request = require('../../models/sprint2/help_request.model');
const NotificationEmployee = require ('../../models/sprint2/notificationEmployee.model');
const User = require('../../models/user.model');
const restaurantModel = require('../../models/restaurant.model');
const help_requestModel = require('../../models/sprint2/help_request.model');
const Notification = require('../../models/sprint2/notification.model')


const help_requestController = {

    addNewHelp: async (req, res) => {
        try {
            // Remove tableId extraction
            const { note, restaurantFK, user } = req.body;
           

            // Update Help_request instantiation to exclude tableNb
            const newHelpRequest = new Help_request({ 
                note: note, 
                etat: false, 
                
                restaurantFK: restaurantFK, // Assuming you have a foreign key to the restaurant
                user: user, // Assuming you want to track which user made the request
            });
    
            const restaurant = await restaurantModel.findById(restaurantFK);
            const newNotification = new Notification({
                userSended: user._id,
                userConcerned: restaurant.owner,
                title: "Request Help",
                body: `Help Request received .`,
               
            });
            await newNotification.save();
            const savedHelpRequest = await newHelpRequest.save();
            return res.status(201).json({ data: savedHelpRequest });
    
        } catch (error) {
            console.log(error)
            return res.status(500).json({ message: error.message });
        }
    },
    addNewHelpweb : async (req, res) => {
        try {
          const userId = req.params.userId;
          const { note, type } = req.body;
      
          const newHelpRequest = new Help_request({
            note: note,
            etat: false,
            user: userId,
            type: type,
          });
      
          const savedHelpRequest = await newHelpRequest.save();
      
          const newNotification = new NotificationEmployee({
            helpRequestFK: savedHelpRequest._id,
            title: "New help request",
            body: `New help request received from user ID ${userId}.`,
          });
      
          await newNotification.save();
      
          return res.status(201).json({ data: savedHelpRequest });
        } catch (error) {
          return res.status(500).json({ message: error.message });
        }
      },

    getHelpById: async (req, res) => {
        try {
            await Help_request.findById(req.params.id)
                .then((docs) => {
                    res.send(docs)
                })
                .catch((err) => {
                    res
                        .status(400)
                        .json({ message: "Help request not found" + "" + err });
                });
        } catch (error) {
            return res.status(500).json({ message: error });
        }
    },

    getHelpList: async (req, res) => {
        try {
            await Help_request.find()

                .sort({ date: 1 })
                .then((data) => {
                    res.json(data);
                })
                .catch((error) => {
                    res.status(400).json({ message: error });
                });
        } catch (error) {
            res.status(500).json({ message: error });
        }
    },

    getHelpListFalse: async (req, res) => {
        try {
            const helpList = await Help_request.find({ etat: false }).sort({ date: -1 });
            res.json(helpList);
        } catch (error) {
            res.status(500).json({ message: error });
        }
    },
    updateHelpRequest: async (req, res) => {
        const { id } = req.params;
        const updateData = req.body;

        try {
            const updatedHelpRequest = await Help_request.findByIdAndUpdate(id, updateData, { new: true });

            if (!updatedHelpRequest) {
                return res.status(404).json({ message: 'Help request not found' });
            }

            res.status(200).json(updatedHelpRequest);
        } catch (error) {
            res.status(500).json({ message: 'Failed to update help request', error: error.message });
        }
    },
    updateHelp: async (req, res) => {
        try {
            
            const { noteEmployee } = req.body;
            const help = await Help_request.findById(req.params.id);
            help.etat= true;
            help.noteEmployee= noteEmployee;
            const savedHelpUpdated = await help.save();
            res.status(200).json(savedHelpUpdated);
        } catch (error) {
            return res.status(500).json({ message: "updating help failed" + "" + error });
        }
    },
    
    insatisfactionHelpRequest: async (req, res) => {
        try {

            const {note, tableNb, type} = req.body;            
            const newHelpRequest = new Help_request({ etat: false, tableNb:tableNb , note: note, type : type});
            
            const savedHelpRequest = await newHelpRequest.save();
            return res.status(201).json({ data: savedHelpRequest });
            
        } catch (error) {
            return res.status(500).json({ message: "request not sent " + " " + error });
        }
    }, 

}

module.exports = help_requestController;