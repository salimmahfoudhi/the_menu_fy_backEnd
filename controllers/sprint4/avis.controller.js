const Avis = require('../../models/sprint4/avis.model');
const NotificationEmployee = require('../../models/sprint2/notificationEmployee.model');
const Order = require('../../models/sprint2/order.model');
const jwt_decode = require("jwt-decode");
const User = require('../../models/user.model');
const Comment = require('../../models/sprint4/commentsAvis');
const stripe = require('stripe')(process.env.STRIPE_KEY);
const Restaurant = require("../../models/restaurant.model");

async function findRestaurantByOwnerId(ownerId) {
    try {
    
      let idUser = ownerId;
      let user =await User.findById(idUser)
      if (user.role=="employee"){
        idUser=user.owner
      }
  
        const restaurant = await Restaurant.findOne({ owner: idUser }).populate('owner');
        return restaurant;
    } catch (error) {
        console.error('Error finding restaurant by owner ID:', error);
        throw error;
    }
  }
const avisController = {

    addAvis: async (req, res) => {
        try {
            const tokenLogin = req.cookies.tokenLogin;
            const decodeTokenLogin = jwt_decode(tokenLogin);
            const idUser = decodeTokenLogin.id;

            if (idUser) {
                const { comment, note, restaurantFK, orderFK ,} = req.body;
                const newAvis = new Avis({ comment: comment, user: idUser, restaurantFK: restaurantFK, note: note, orderFK: orderFK,});

                const order = await Order.findById(orderFK).populate('user').populate('restaurantFK');
                order.dateAvis = new Date();
                order.avisAdded = true
                await order.save()
                const savedAvis = await newAvis.save();
                return res.status(201).json({ data: savedAvis });
            } 

        } catch (error) {
            return res.status(500).json({ message: error });
        }
    },
   addAvisWeb: async (req, res) => {
    try {
      const userId = req.params.userId;
      const { comment, note, restaurantFK, orderFK } = req.body;

      

      if (userId) {
        const newAvis = new Avis({ comment: comment, user: userId, restaurantFK: restaurantFK, note: note, orderFK: orderFK });

        const order = await Order.findById(orderFK).populate('user').populate('restaurantFK');
        order.dateAvis = new Date();
        order.avisAdded = true;
        await order.save();

        const savedAvis = await newAvis.save();
        return res.status(201).json({ data: savedAvis });
      } else {
        return res.status(400).json({ message: 'User ID is required' });
      }
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },        

    getAllAvis: async (req, res) => {
        try {
            const tokenLogin = req.cookies.tokenLogin;
            const decodeTokenLogin = jwt_decode(tokenLogin);
            const idUser = decodeTokenLogin.id;

            const userResto = await User.findById(idUser);
            await Avis.find({ restaurantFK: userResto.restaurantFK })
                .sort({ date: -1 })
                .populate('user')
                .populate('orderFK')
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
    getAllAvisweb :async (req, res) => {
        const userId = req.params.userId;

        try {
          const reviews = await Avis.find({ user: userId })
            .populate('orderFK')
            .populate('restaurantFK')
            .exec();
      
          if (!reviews) {
            return res.status(404).json({ message: 'No reviews found for this user.' });
          }
      
          res.status(200).json(reviews);
        } catch (error) {
          console.error('Error fetching reviews:', error);
          res.status(500).json({ message: 'Server error. Please try again later.' });
        }
    },
    getAvisById: async (req, res) => {
        try {
            await Avis.findById(req.params.id).populate('restaurantFK').populate('user')
                .then((docs) => {
                    res.send(docs)
                })
                .catch((err) => {
                    res
                        .status(400)
                        .json({ message: "Avis not found" + "" + err });
                });
        } catch (error) {
            return res.status(500).json({ message: error });
        }
    },

    getAvisByUser: async (req, res) => {
        try {
            const tokenLogin = req.cookies.tokenLogin;
            const decodeTokenLogin = jwt_decode(tokenLogin);
            const idUser = decodeTokenLogin.id;
            await Avis.find({ user: idUser }).sort({ createdAt: -1 }).populate('restaurantFK')

                .then((docs) => {
                    res.send(docs)
                })
                .catch((err) => {
                    res
                        .status(400)
                        .json({ message: "Avis not found " + err });
                });
        } catch (error) {
            return res.status(500).json({ message: error });
        }
    },

    responseAvis: async (req, res) => {
        try {
            const { response } = req.body;
            const avis = await Avis.findById(req.params.id);
            avis.response = response;

            const savedAvis = await avis.save();
            res.status(200).json(savedAvis);
        } catch (error) {
            return res.status(500).json({ message: "reponse review failed " + error });
        }
    },

    addCommentToAvis: async (req, res) => {
        try {
            const tokenLogin = req.cookies.tokenLogin;
            const decodeTokenLogin = jwt_decode(tokenLogin);
            const idUser = decodeTokenLogin.id;

            const idAvis = req.params.idAvis
            const { comment, restaurantFK } = req.body;
            const newComment = new Comment({ comment: comment, avisFK: idAvis, user: idUser, restaurantFK: restaurantFK })

            const savedComment = await newComment.save();
            return res.status(201).json({ data: savedComment });

        } catch (error) {
            return res.status(500).json({ message: "reponse review failed " + error });
        }
    },

    getCommentsByAvis: async (req, res) => {
        try {
            const idAvis = req.params.idAvis;
            const comment = await Comment.find({ avisFK: idAvis })
                .sort({ createdAt: 1 })
                .populate('user')
                .populate('restaurantFK')
                .populate('avisFK')

            return res.status(200).json({ data: comment });

        } catch (error) {
            return res.status(500).json({ message: "reponse review failed " + error });
        }
    },
    getReviewsByRestaurant : async (req, res) => {
        try {
            const restaurantId = req.params.restaurantId;
        
            // Verify the restaurantId is a valid ObjectId
           
        
            const reviews = await Avis.find({ restaurantFK: restaurantId })
              .populate('user', 'firstName lastName image') // Populate user details
              .select('comment note date user') // Select only the required fields
              .sort({ date: -1 }); // Sort by date in descending order
        
            res.status(200).json(reviews);
          } catch (error) {
            console.error('Error fetching reviews:', error);
            res.status(500).json({ message: error.message });
          }
    },
    getAllAvisByResturantPagination: async (req, res) => {
        try {

            const tokenLogin = req.get('Authorization').split(' ')[1];
            let decodeTokenLogin = jwt_decode(tokenLogin);
            let idUser = decodeTokenLogin.id;
            // let idUser = '64ec84b22b8071e06b57e415';
            let user =await User.findById(idUser)
            if (user.role=="employee"){
              idUser=user.owner;
            }
            const restaurant = await findRestaurantByOwnerId(idUser);
            const restaurantId = restaurant._id;

            const page = parseInt(req.query.page) || 1;
            const limit = 5;
            const skip = (page - 1) * limit;
            const searchQuery = req.query.search || '';

            let query = {};
           

            // Update query to include createdAt > current date at 00:00
            //query.createdAt = { $gt: now };
          
            if (searchQuery) {
                const searchNumber = parseInt(searchQuery);
                if (!isNaN(searchNumber)) {
                    query.comment = searchNumber;
                } else {
                    res.status(400).json({ message: "Invalid search query." });
                    return;
                }
            }

            const avis = await Avis.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate({
                    path: 'user'                   
                });
            const total = await Avis.countDocuments(query);
            res.json({ avis, total });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server Error" });
        }
    },
    
      
}

module.exports = avisController;