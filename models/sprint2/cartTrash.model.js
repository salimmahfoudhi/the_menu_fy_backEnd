const mongoose = require("mongoose");

const cartTrashSchema = new mongoose.Schema(
  {
    productFK: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    tableNb: { type: Number },
    ingredientFK: [{ type: mongoose.Schema.Types.ObjectId, ref: "Ingredient" }],
    itemsFK: [{ type: mongoose.Schema.Types.ObjectId, ref: "Items" }],
    quantityProduct: [{ type: Number }],
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    restaurantFK: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" }
  }, { timestamps: true }
);

const cartTrashModel = mongoose.model("CartTrash", cartTrashSchema);
module.exports = cartTrashModel;