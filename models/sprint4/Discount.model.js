// models/Discount.js

const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true, // Ensure discount codes are unique
  },
  percentage: {
    type: Number,
    required: true,
    min: 0,  // Percentage cannot be negative
    max: 100, // Ensure it does not exceed 100%
  },
  expiryDate: {
    type: Date, // Expiry date for the discount
   
  },
  maxUses: {
    type: Number, // Maximum number of times the discount can be used
    default: 1,
  },
  currentUses: {
    type: Number, // Number of times the discount has been used
    default: 0,
  },
});

const Discount = mongoose.model('Discount', discountSchema);

module.exports = Discount;