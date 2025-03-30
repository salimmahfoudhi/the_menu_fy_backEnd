// controllers/discountController.js
const jwt_decode = require("jwt-decode");
const Discount = require('../../models/sprint4/discount.model');
const User = require('../../models/user.model');
const Restaurant = require('../../models/restaurant.model');

async function findRestaurantByOwnerId(ownerId) {
  try {
    const restaurant = await Restaurant.findOne({ owner: ownerId }).populate('owner');
    return restaurant;
  } catch (error) {
    console.error('Error finding restaurant by owner ID:', error);
    throw error;
  }
}

// Function to get discount by code
const getDiscount = async (req, res) => {
  const { code } = req.body;

  try {
    const discount = await Discount.findOne({ code });

    if (!discount) {
      return res.status(404).json({ message: 'Discount code not found' });
    }
    // Update current uses count
    discount.currentUses += 1;
    await discount.save();
    res.status(200).json({
      valid: true,
      code: discount.code,
      percentage: discount.percentage,
      expiryDate: discount.expiryDate,
      maxUses: discount.maxUses,
      currentUses: discount.currentUses,
    });
  } catch (error) {
    console.error('Error fetching discount:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
// controllers/discountController.js

// Function to create a new discount
const createDiscount = async (req, res) => {
  const tokenLogin = req.get('Authorization').split(' ')[1];
  let decodeTokenLogin = jwt_decode(tokenLogin);
  let idUser = decodeTokenLogin.id;
  let user = await User.findById(idUser)
  if (user.role == "employee") {
    idUser = user.owner;
  }
  const restaurant = await findRestaurantByOwnerId(idUser);
  const restaurantId = restaurant._id;
  const { code, percentage, expiryDate, maxUses } = req.body;
  try {
    // Create a new discount
    const newDiscount = new Discount({
      code,
      percentage,
      expiryDate,
      maxUses,
      restaurant: restaurantId,
      valid: true
    });

    // Save the discount to the database
    await newDiscount.save();

    res.status(201).json({
      message: 'Discount code created successfully',
      discount: newDiscount,
    });
  } catch (error) {
    console.error('Error creating discount:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getDiscountPagination = async (req, res, next) => {
  try {
    console.log('data ')

    const tokenLogin = req.get('Authorization').split(' ')[1];
    let decodeTokenLogin = jwt_decode(tokenLogin);
    let idUser = decodeTokenLogin.id;


    let user = await User.findById(idUser)
    if (user.role == "employee") {
      idUser = user.owner;
    }
    const restaurant = await findRestaurantByOwnerId(idUser);
    const restaurantId = restaurant._id;

    const page = parseInt(req.query.page) || 1;
    const limit = 6;
    const skip = (page - 1) * limit;
    const searchQuery = req.query.search || '';

    let query = {};
   // query.restaurant = restaurantId;
    if (searchQuery) {
      query.code = { $regex: new RegExp(searchQuery, 'i') };
    }

    const discount = await Discount.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await Discount.countDocuments(query);
    //console.log('data ' + restaurantId)

    res.json({ discount, total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const deleteById = async (req, res) => {
  try {
    const discountId = req.params.id;

    // Delete the table
    const discount = await Discount.findByIdAndDelete(discountId);



    res.status(200).json({ message: "discount deleted successfully", data: discount });
  } catch (error) {
    res.status(500).json({ message: "An error occurred", error: error.message });
  }
};
const updateDiscountById = async (req, res) => {
  try {
    const { code, percentage, expiryDate, maxUses } = req.body;
    const discount = await Discount.findById(req.params.id);

    const existingDiscount = await Discount.findOne({ code, percentage, expiryDate, maxUses });
    if (existingDiscount && existingDiscount._id.toString() !== discount._id.toString()) {
      return res.status(409).json({ message: "Ce numéro de table existe déjà." });
    }
    discount.code = code;
    discount.percentage = percentage;
    discount.expiryDate = expiryDate;
    discount.maxUses = maxUses;

    await discount.save();




  } catch (error) {
    return res.status(500).json({ message: "Updating table failed: " + error });
  }
};
module.exports = {
  getDiscount,
  createDiscount,
  getDiscountPagination,
  deleteById,
  updateDiscountById

};



