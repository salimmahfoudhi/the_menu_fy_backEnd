const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    productFK:[ {  type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    tableNb: {  type: Number },
    ingredientFK : [{type: mongoose.Schema.Types.ObjectId, ref: "Ingredient" }],
    itemsFK : [{type: mongoose.Schema.Types.ObjectId, ref: "Items" }],
    quantityProduct: [{ type: Number }],
    user : {type: mongoose.Schema.Types.ObjectId, ref: "User"}
  },{timestamps: true}
);

const cartModel = mongoose.model("Cart", cartSchema);
module.exports = cartModel;