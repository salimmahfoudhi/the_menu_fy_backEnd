const mongoose = require("mongoose");

const cartOrderSchema = new mongoose.Schema(
  {
    productFK: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    tableNb: { type: Number },
    ingredientFK: [{ type: mongoose.Schema.Types.ObjectId, ref: "Ingredient" }],
    itemsFK: [{ type: mongoose.Schema.Types.ObjectId, ref: "Items" }],
    quantityProduct: [{ type: Number }],
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    restaurantFK: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
    productsSuggestion:[ { type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    statusPay: { type: Boolean, default: false } // Nouveau champ pour le statut de paiement
  }, 
  { timestamps: true }
);

const CartOrder = mongoose.model("CartOrder", cartOrderSchema);
module.exports = CartOrder;
