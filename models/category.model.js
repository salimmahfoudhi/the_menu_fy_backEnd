const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    libelle: { type: String, required: true, unique: true },
    description: { type: String },
    photo: { type: String, unique: true },
    visibility: { type: String, default: "ENABLE" },
    menu: { type: mongoose.Schema.Types.ObjectId, ref: "Menu" },
    
  },
  {
    timestamps: true,
  }
);

const categoryModel = mongoose.model("Category", categorySchema);
module.exports = categoryModel;
