const reclamation = require('../../models/sprint4/reclamation.model');
const NotificationEmployee = require('../../models/sprint2/notificationEmployee.model');
const Notification = require('../../models/sprint2/notification.model');
const Order = require('../../models/sprint2/order.model');
const jwt_decode = require("jwt-decode");
const multer = require('multer');
const User = require('../../models/user.model');
const restaurantModel = require('../../models/restaurant.model');
const help_requestModel = require('../../models/sprint2/help_request.model');

// ----------- Multer image ----------------------------
const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpeg',
    'image/png': 'png'
};

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, './uploads/reclamation/');
    },
    filename: (req, file, callback) => {
        const originalName = file.originalname;
        const extension = MIME_TYPES[file.mimetype];
        callback(null, originalName);
    }
});
const upload = multer({ storage: storage }).single("image");

const reclamationController = {


    addReclamation: async (req, res) => {
        try {
            const tokenLogin = req.cookies.tokenLogin;
            const decodeTokenLogin = jwt_decode(tokenLogin);
            const idUser = decodeTokenLogin.id;

            if (idUser) {
                const { message, type, tableNb, restaurantFK, orderFK, image } = req.body;
                const newReclamation = new reclamation({ statusReclamation: false, message: message, type: type, tableNb: tableNb, image: image, restaurantFK: restaurantFK, orderFK: orderFK, user: idUser });
                const restaurant = await restaurantModel.findById(restaurantFK);
                const newNotification = new Notification({
                    userSended: idUser,
                    userConcerned: restaurant.owner,
                    title: "New claim",
                    body: `New claim received from table N° ${tableNb}.`,
                   
                });
                await newNotification.save();
                const savedReclamation = await newReclamation.save();
                return res.status(201).json({ data: savedReclamation });
            }

        } catch (error) {
            return res.status(500).json({ message: error });
        }
    },


    addImageReclamation: async (req, res) => {
        try {
            const tokenLogin = req.cookies.tokenLogin;
            let decodeTokenLogin = jwt_decode(tokenLogin);
            let idUser = decodeTokenLogin.id;

            const image = req?.file?.filename;

            const Reclamation = await reclamation.findOne({ user: idUser }).sort({ createdAt: -1 })
            Reclamation.image = image;
            const save = await Reclamation.save()
            return res.status(200).json({ data: save })

        } catch (err) {
            return res.status(500).json({ message: "Something wrong " + err.message });
        }
    },
    addReclamationweb: async (req, res) => {
        try {
          const userId = req.params.userId;
          const { message, type, tableNb, restaurantFK } = req.body;
      
          // Create a new reclamation object
          const newReclamation = new reclamation({
            statusReclamation: false,
            message,
            type,
            tableNb,
            restaurantFK,
            user: userId,
          });
      
          // Create a new notification for the employee
          const newNotification = new NotificationEmployee({
            reclamationFK: newReclamation._id,
            title: "New claim",
            body: `New claim received from table N° ${tableNb}.`,
          });
      
          // Save the notification and reclamation to the database
          await newNotification.save();
          const savedReclamation = await newReclamation.save();
      
          // Return the saved reclamation data
          return res.status(201).json({ data: savedReclamation });
        } catch (error) {
          return res.status(500).json({ message: error.message });
        }
      },
      
      
    //   updateReclamation: async (req, res) => {
    //     try {
    //       const updatedFields = req.body;
    //       const updatedReclamation = await reclamation.findByIdAndUpdate(req.params.id, updatedFields, { new: true });
    //       res.status(200).json(updatedReclamation);
    //     } catch (error) {
    //       res.status(500).json({ message: "Error updating reclamation: " + error.message });
    //     }
    //   },
      updateReclamation : async (req, res) => {
        const { id } = req.params;
        const updateData = req.body;
      
        try {
          const updatedReclamation = await reclamation.findByIdAndUpdate(id, updateData, { new: true });
      
          if (!updatedReclamation) {
            return res.status(404).json({ message: 'Reclamation not found' });
          }
      
          res.status(200).json(updatedReclamation);
        } catch (error) {
          res.status(500).json({ message: 'Failed to update reclamation', error: error.message });
        }
      },
      
      addImageReclamationweb: async (req, res) => {
        try {
          const userId = req.params.userId;
          const image = req.file.filename;
      
          const reclamation = await reclamation.findOne({ user: userId }).sort({ createdAt: -1 });
          if (reclamation) {
            reclamation.image = image;
            const savedReclamation = await reclamation.save();
            return res.status(200).json({ data: savedReclamation });
          } else {
            return res.status(404).json({ message: "Reclamation not found" });
          }
        } catch (err) {
          return res.status(500).json({ message: "Something wrong " + err.message });
        }
      },
      
    getAllReclamations: async (req, res) => {
        try {
            const tokenLogin = req.cookies.tokenLogin;
            const decodeTokenLogin = jwt_decode(tokenLogin);
            const idUser = decodeTokenLogin.id;

            const user = await User.findById(idUser);
            await reclamation.find({ restaurantFK: user.restaurantFK })
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

    getReclamationNotTretead: async (req, res) => {
        try {
            const rec = await reclamation.find({ statusReclamation: false }).sort({ date: -1 });
            res.json(rec);
        } catch (error) {
            res.status(500).json({ message: error });
        }
    },

    getReclamationById: async (req, res) => {
        try {
            await reclamation.findById(req.params.id)
                .then((docs) => {
                    res.send(docs)
                })
                .catch((err) => {
                    res
                        .status(400)
                        .json({ message: "Reclamation not found" + "" + err });
                });
        } catch (error) {
            return res.status(500).json({ message: error });
        }
    },

    getReclamationByUser: async (req, res) => {
        try {
            const tokenLogin = req.cookies.tokenLogin;
            const decodeTokenLogin = jwt_decode(tokenLogin);
            const idUser = decodeTokenLogin.id;

            await reclamation.find({ user: idUser })
                .then((docs) => {
                    res.send(docs)
                })
                .catch((err) => {
                    res
                        .status(400)
                        .json({ message: "Reclamation not found " + err });
                });
        } catch (error) {
            return res.status(500).json({ message: error });
        }
    },
    getReclamationWeb: async (req, res) => {
        try {
            const userId = req.params.userId;
    
            await reclamation.find({ user: userId })
                .populate('user')
                .then((docs) => {
                    res.send(docs);
                })
                .catch((err) => {
                    res
                        .status(400)
                        .json({ message: "Reclamation not found " + err });
                });
        } catch (error) {
            return res.status(500).json({ message: error });
        }
    },
    
    executeReclamation: async (req, res) => {
        try {
            const { response } = req.body;
            const Reclamation = await reclamation.findById(req.params.id);
            Reclamation.response = response;
            Reclamation.statusReclamation = true;
            const savedReclamation = await Reclamation.save();
            res.status(200).json(savedReclamation);
        } catch (error) {
            return res.status(500).json({ message: "updating reclamation failed " + error });
        }
    },

    getAllReclamationsByUser: async (req, res) => {
        try {
            const tokenLogin = req.cookies.tokenLogin;
            const decodeTokenLogin = jwt_decode(tokenLogin);
            const idUser = decodeTokenLogin.id;

            await reclamation.find({ user: idUser })
                .sort({ date: -1 })
                .populate("restaurantFK")
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
    updateReclamation : async (req, res) => {
        const { id } = req.params;
        const updateData = req.body;
      
        try {
          const updatedReclamation = await reclamation.findByIdAndUpdate(id, updateData, { new: true });
      
          if (!updatedReclamation) {
            return res.status(404).json({ message: 'Reclamation not found' });
          }
      
          res.status(200).json(updatedReclamation);
        } catch (error) {
          res.status(500).json({ message: 'Failed to update reclamation', error: error.message });
        }
      },
    getReclamationByRestaurant: async (req, res) => {
        try {
          const tokenLogin = req.get('Authorization').split(' ')[1];
           let decodeTokenLogin = jwt_decode(tokenLogin);
           let idUser = decodeTokenLogin.id;
           // let idUser='64ec84b22b8071e06b57e415'
            let user =await User.findById(idUser)
            if (user.role=="employee"){
              idUser=user.owner;
            }
           // console.log('idUer'+ idUser)
              const restaurant = await restaurantModel.findOne({ owner: idUser }).populate('owner');
             // console.log('restaurant._id'+ restaurant._id)

             const restaurantId = restaurant._id;


             const page = parseInt(req.query.page) || 1;
             const limit = 6;
             const skip = (page - 1) * limit;
             const searchQuery = req.query.search || '';

             let query = {}; 
            // query.owner = idUser; 
             if (searchQuery) {
               query.message = { $regex: new RegExp(searchQuery, 'i') };
             
          }
          //  await reclamation.find({ restaurantFK: restaurant._id }).populate('user')
          const reclamations = await reclamation.find(query).populate('user')
                .sort({ createdAt: -1 })
                .skip(skip).limit(limit);                
                const total = await reclamation.countDocuments(query);
              // console.log('reclamations'+JSON.stringify(reclamations))
                res.json({ reclamations, total });
        } catch (error) {
          console.log('erreur '+error)
            res.status(500).json({ message: error });
            
        }
    },
    getHelpRequestRestaurant: async (req, res) => {
        try {
          const tokenLogin = req.get('Authorization').split(' ')[1];
          let decodeTokenLogin = jwt_decode(tokenLogin);
          let idUser = decodeTokenLogin.id;
          // let idUser='64ec84b22b8071e06b57e415'
           let user =await User.findById(idUser)
           if (user.role=="employee"){
             idUser=user.owner;
           }
          // console.log('idUer'+ idUser)
             const restaurant = await restaurantModel.findOne({ owner: idUser }).populate('owner');
            // console.log('restaurant._id'+ restaurant._id)

            const restaurantId = restaurant._id;

            const page = parseInt(req.query.page) || 1;
            const limit = 6;
            const skip = (page - 1) * limit;
            const searchQuery = req.query.search || '';

            let query = {  }; 
           // query.owner = idUser; 
            if (searchQuery) {
              query.message = { $regex: new RegExp(searchQuery, 'i') };
            
         }
          //  await reclamation.find({ restaurantFK: restaurant._id }).populate('user')
          const help_reques = await help_requestModel.find({  }).populate('user')
          .sort({ createdAt: -1 })
          .skip(skip).limit(limit);                
          const total = await help_requestModel.countDocuments(query);
         console.log('help_reques'+JSON.stringify(help_reques))
          res.json({ help_reques, total });
        } catch (error) {
            res.status(500).json({ message: error });
        }
    },
    updateReclamationStatus: async (req, res) => {
       
        const { id } = req.params;
      
        try {

            const reclamationUpdate = await reclamation.findById(id);

            if (!reclamationUpdate) {
              return res.status(404).json({ message: "reclamationUpdate not found" });
            }
        
            reclamationUpdate.statusReclamation = !reclamationUpdate.statusReclamation;
            await reclamationUpdate.save();



      
          res.status(200).json(reclamationUpdate);
        } catch (error) {
          res.status(500).json({ message: 'Failed to update reclamation', error: error.message });
        }
    },
    updateHelpStatus: async (req, res) => {
       
        const { id } = req.params;
      
        try {

            const helpUpdate = await help_requestModel.findById(id);

            if (!helpUpdate) {
              return res.status(404).json({ message: "help Update not found" });
            }
        
            helpUpdate.etat = !helpUpdate.etat;
            await helpUpdate.save();



      
          res.status(200).json(helpUpdate);
        } catch (error) {
          res.status(500).json({ message: 'Failed to update reclamation', error: error.message });
        }
    },

}

module.exports = reclamationController;