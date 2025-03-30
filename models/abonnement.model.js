const mongoose = require("mongoose");

const abonnementcSchema = new mongoose.Schema(
  {
    nom: { type: String },
    description: { type: String },
    price: { type: Number },
    subscriptionTier: { type: String, enum: ['Basic', 'Premium', 'Enterprise'], default: 'Basic' },
    maxRestaurants: { type: Number, default: 1 },
    duration: { type: String, enum: ['Monthly', 'Yearly'], default: 'Monthly' },
    discount: { type: Number, default: 0 },
    color : { type: String },
    promoCode: { type: String },
    extraFeatures: [{ type: String }],
    status: { type: String, enum: ['Active', 'Expired', 'Cancelled'], default: 'Active' },
    supportLevel: { type: String, enum: ['Basic', 'Priority', '24/7'], default: 'Basic' },
  },
  {
    timestamps: true,
  }
);

const Abonnementfr = mongoose.model("Abonnementfr", abonnementcSchema);
module.exports = Abonnementfr;
