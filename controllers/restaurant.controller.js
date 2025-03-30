const Restaurant = require("../models/restaurant.model");
const ArchivedFieldCRM = require("../models/archivedFieldCRM");
const jwt_decode = require("jwt-decode");
const axios = require('axios');
const cheerio = require('cheerio');
const Taxe = require('../models/taxe');
const User = require("../models/user.model");
const PaiementModel = require("../models/paiement");



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
const archivedFieldCRM = async (restaurantId, body) => {
  try {
    // Check if the restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      throw new Error('Restaurant not found');
    }

    // Create a new ArchivedFieldCRM document


    if ( body.nameRes !== restaurant.nameRes) {
      // Create a new ArchivedFieldCRM document with updated nameRes
      const archivedField = new ArchivedFieldCRM({
        nameRes: restaurant.nameRes,
        restaurant: restaurantId
      });

      // Save the archived field document
      const savedArchivedField = await archivedField.save();
    }

    if (body.address !== restaurant.address) {
      // Create a new ArchivedFieldCRM document with updated address
      const archivedField = new ArchivedFieldCRM({
        address: restaurant.address,
        restaurant: restaurantId
      });

      // Save the archived field document
      const savedArchivedField = await archivedField.save();
    }

    if ( body.logo !== restaurant.logo) {
      // Create a new ArchivedFieldCRM document with updated address
      const archivedField = new ArchivedFieldCRM({
        logo: restaurant.logo,
        restaurant: restaurantId
      });     

      // Save the archived field document
      const savedArchivedField = await archivedField.save();
    }    
    if ( body.facebookLink !== restaurant.facebookLink) {
      // Create a new ArchivedFieldCRM document with updated address
      const archivedField = new ArchivedFieldCRM({
        facebookLink: restaurant.facebookLink,
        restaurant: restaurantId
      });     

      // Save the archived field document
      const savedArchivedField = await archivedField.save();
    }
      
    if ( body.twitterLink !== restaurant.twitterLink) {
      // Create a new ArchivedFieldCRM document with updated address
      const archivedField = new ArchivedFieldCRM({
        twitterLink: restaurant.twitterLink,
        restaurant: restaurantId
      });     

      // Save the archived field document
      const savedArchivedField = await archivedField.save();
    }
    if ( body.instagramLink !== restaurant.instagramLink) {
      // Create a new ArchivedFieldCRM document with updated address
      const archivedField = new ArchivedFieldCRM({
        instagramLink: restaurant.instagramLink,
        restaurant: restaurantId
      });     

      // Save the archived field document
      const savedArchivedField = await archivedField.save();
    }
    if ( body.tiktokLink !== restaurant.tiktokLink) {
      // Create a new ArchivedFieldCRM document with updated address
      const archivedField = new ArchivedFieldCRM({
        tiktokLink: restaurant.tiktokLink,
        restaurant: restaurantId
      });     

      // Save the archived field document
      const savedArchivedField = await archivedField.save();
    }
    if ( body.phone !== restaurant.phone) {
      // Create a new ArchivedFieldCRM document with updated address
      const archivedField = new ArchivedFieldCRM({
        phone: restaurant.phone,
        restaurant: restaurantId
      });     

      // Save the archived field document
      const savedArchivedField = await archivedField.save();
    }
    if ( body.email !== restaurant.email) {
      // Create a new ArchivedFieldCRM document with updated address
      const archivedField = new ArchivedFieldCRM({
        email: restaurant.email,
        restaurant: restaurantId
      });     

      // Save the archived field document
      const savedArchivedField = await archivedField.save();
    }

  } catch (error) {
    throw error; // Throw any errors
  }
};
const RestoController = {
    
    getRestoData : async (req, res) => {
        const restoId = req.params.restoId
        const restaurant = await Restaurant.findById(restoId);
        
        res.status(200).json(restaurant);
    },
    
    retrieveAll: async (req, res) => {
        try {
          req = null;
          await Restaurant.find()
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

      updateRestaurantCRM: async (req, res) => {
        const { restaurantId } = req.params;
      
        try {
          const updatedFields = { ...req.body };
        //  console.log('data :'+updatedFields)
          if (req.files && req.files.logo) {
            const logoFile = req.files.logo[0]; // Assuming only one file is uploaded
            updatedFields.logo = logoFile.filename; // Save the filename to the restaurant document
          }
      
          // Handle images file upload
          if (req.files && req.files.images) {
            const imagesFile = req.files.images[0]; // Assuming only one file is uploaded
            updatedFields.images = imagesFile.filename; // Save the filename to the restaurant document
          }

         // await archivedFieldCRM(restaurantId, updatedFields);      
          const updatedRestaurant = await Restaurant.findOneAndUpdate(
            { _id: restaurantId },
            { $set: updatedFields },
            { new: true }
          );

        
      
          if (!updatedRestaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
          }
      
          res.status(200).json(updatedRestaurant);
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Internal Server Error' });
        } 
              
      },
      getRestaurantByName: async (req, res) => {
        const { nameRes } = req.params;
    
        try {
          const restaurant = await Restaurant.findOne({ nameRes: new RegExp(nameRes, 'i') });
    
          if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
          }
    
          res.status(200).json(restaurant);
        } catch (error) {
          console.error('Error fetching restaurant by name:', error);
          res.status(500).json({ message: "Internal server error" });
        }
      },
      getArchivedFieldCRMPagination: async (req, res, next) => {
        try {
          const page = parseInt(req.query.page) || 1;
          const limit = 5; 
          const skip = (page - 1) * limit;
          const searchQuery = req.query.search || ''; 

          const tokenLogin = req.get('Authorization').split(' ')[1];
          let decodeTokenLogin = jwt_decode(tokenLogin);
          let idUser = decodeTokenLogin.id;
          const  restaurant = await findRestaurantByOwnerId(idUser)
          const restaurantId = restaurant._id
          const field=req.params.field

          let query = {
            [field]: { $exists: true, $ne: '' } ,// Additional condition to filter by nameRes not empty          

          };
          query.restaurant = restaurantId; // Filter by restaurantId
          if (searchQuery) {
            query[field] = { $regex: new RegExp(searchQuery, 'i') };
          }
      
          // Additional condition to filter by nameRes not empty
      
        //  const archivedFields = await ArchivedFieldCRM.find(query).skip(skip).limit(limit);

          const archivedFields = await ArchivedFieldCRM.find(query)
          .populate({
            path: 'restaurant',
          //  match: { _id: restaurantId } // Filter restaurants by ID
          })
          .skip(skip)
          .limit(limit);

          const total = await ArchivedFieldCRM.countDocuments(query);
      
          res.json({ archivedFields, total });
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: "Server Error" });
        }
      },

      
      unArchiveCrmById: async (req, res) => {
        try {
          const tokenLogin = req.get('Authorization').split(' ')[1];
          let decodeTokenLogin = jwt_decode(tokenLogin);
          let idUser = decodeTokenLogin.id;
          const restaurant = await findRestaurantByOwnerId(idUser);
          const restaurantId = restaurant._id;
      
          const idCrm = req.params.idCrm;
          const field = req.params.field;
      
          const crm = await ArchivedFieldCRM.findById(idCrm);
        
          if (!crm) {
            return res.status(404).json({ message: "CRM not found" });
          }
      
          // Check if the field exists in the restaurant
          if (!restaurant[field]) {
            return res.status(400).json({ message: "Field does not exist in the restaurant" });
          }
      
          // Create a new ArchivedFieldCRM document with updated field value
          const archivedField = new ArchivedFieldCRM({
            [field]: restaurant[field], // Assign the field value from the restaurant
            restaurant: restaurantId // Assign the restaurant ID directly
          }); 
          const savedArchivedField = await archivedField.save();
        
          // Update the restaurant field with the value from the CRM
          restaurant[field] = crm[field];
      
          // Save the restaurant with the updated field
          await restaurant.save();
        
          // Delete the CRM document
          await crm.deleteOne();
      
          res.status(200).json({ message: "Unarchived Field", data: restaurant[field] });
        } catch (error) {
          res.status(500).json({ message: "An error occurred", error: error.message });
        }
      },
      getTaxeCanada : async (req, res, next) => {
        try {
            const response = await axios.get('https://www.canada.ca/fr/agence-revenu/services/impot/entreprises/sujets/tps-tvh-entreprises/facturer-percevoir-quel-taux/calculatrice.html');
            const $ = cheerio.load(response.data);
         
            const table = $('table.small').first();
        
        // Extracting data from the selected table
        const rows = table.find('tbody tr');
            const taxeData = [];
            rows.each((index, row) => {
                const columns = $(row).find('td');
                const region = $(columns[0]).text().trim();
                const taxeTPS = $(columns[1]).text().trim().replace(/[^0-9.,-]+/g, '');
                const taxeTVQ = $(columns[2]).text().trim().replace(/[^0-9.,-]+/g, '');
                
                // Pushing the extracted data into an array
                taxeData.push({ region, taxeTPS, taxeTVQ });
            });

            await Taxe.deleteMany({}); // Remove existing data
            const savedData = await Taxe.insertMany(taxeData); // Save new data
          
            res.status(200).json(savedData);    
        } catch (error) {
            console.error(error);
            res.status(500).send('Error fetching news');
        }
    },
    getAllTaxe: async (req, res, next) => {
      try {
          const allTaxe = await Taxe.find();
          res.status(200).json(allTaxe);
      } catch (error) {
          console.error(error);
          res.status(500).send('Error fetching tax data');
      }
  },
  findRestaurantByUserId: async (req, res, next)=> {
    try {
      let idUser = req.params.idUser

 
      let user =await User.findById(idUser)
      if (user.role=="employee"){
        idUser=user.owner;
      }
        const restaurant = await Restaurant.findOne({ owner: idUser }).populate('owner');
       

        
        res.send(restaurant)
    } catch (error) {
        console.error('Error finding restaurant by owner ID:', error);
        throw error;
    }
  },
    
////////////////web//////////
searchRestaurants: async (req, res) => {
  const { nameRes, address, cuisineType } = req.query;

  try {
    const query = {};

    if (nameRes) {
      query.nameRes = new RegExp(nameRes, 'i');
    }
    if (address) {
      query.address = new RegExp(address, 'i');
    }
    if (cuisineType) {
      query.cuisineType = new RegExp(cuisineType, 'i');
    }

    console.log('Search Query:', query); // Log the query

    const restaurants = await Restaurant.find(query);
    console.log('Search Results:', restaurants); // Log the results

    res.status(200).json(restaurants);
  } catch (error) {
    console.error('Error searching for restaurants:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
},
getAllPaiementForRestaurant: async (req, res, next) => {
  try {

      const tokenLogin = req.get('Authorization').split(' ')[1];
      let decodeTokenLogin = jwt_decode(tokenLogin);
      let idUser = decodeTokenLogin.id;
      // let idUser = '64ec84b22b8071e06b57e415';
      const restaurant = await findRestaurantByOwnerId(idUser);
      const restaurantId = restaurant._id;

      const page = parseInt(req.query.page) || 1;
      const limit = 30;
      const skip = (page - 1) * limit;
      const searchQuery = req.query.search || '';

      let query = {};
      // Get current date
      const now = new Date();
      // Set time to 00:00:00
      now.setHours(0, 0, 0, 0);

      // Update query to include createdAt > current date at 00:00
      //query.createdAt = { $gt: now };
   //   query.statusOrder = { $in: ['Waiting'] };

      if (searchQuery) {
          const searchNumber = parseInt(searchQuery);
          if (!isNaN(searchNumber)) {
              query.cart = searchNumber;
          } else {
              res.status(400).json({ message: "Invalid search query. Please provide a number." });
              return;
          }
      }

      const Paiement = await PaiementModel.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('user');
      const total = await PaiementModel.countDocuments(query);

      res.json({ Paiement, total });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server Error" });
  }
},
 
getRestaurantsByStatus : async (req, res) => {
  try {
    const status = req.params.status;
    const restaurants = await Restaurant.find({ status: status });
    res.send(restaurants);
  } catch (err) {
    console.error('Error retrieving restaurants by status:', err);
    res.status(500).send('An error occurred while retrieving restaurants by status.');
  } 

},
};

module.exports = RestoController;