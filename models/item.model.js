const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    title: { type: String},
    img : {type : String} ,
    price: { type: Number },
    visibility: { type: Boolean, default: true },
    state : {type : String},
    ingredientFK: { type: mongoose.Schema.Types.ObjectId, ref: "Ingredient" },
  },
  {
    timestamps: true,
  }
);

const itemModel = mongoose.model("Items", itemSchema);
module.exports = itemModel;
