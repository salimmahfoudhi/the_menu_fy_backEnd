const mongoose = require("mongoose");

const ingredientSchema = new mongoose.Schema(
  {
    libelle: { type: String},
    img : {type : String},
    type: { type: String },
    minNbOfSelectedItem : {type : Number},
    maxNbOfSelectedItem : {type : Number},
    isExtra : {type : Boolean, default: false},
    quantity: { type: Number },
    price: { type: Number },
    disponibility: { type: String, default: "Yes" },
    qtMax : {type: Number, default : 1},
    productFK: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  },
  {
    timestamps: true,
  }
);

const ingredientModel = mongoose.model("Ingredient", ingredientSchema);
module.exports = ingredientModel;
