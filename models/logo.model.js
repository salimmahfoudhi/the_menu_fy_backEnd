const mongoose = require("mongoose");

const logoSchema = new mongoose.Schema(
  {
    name: { type: String},
    img : {type : String} ,

  },
  {
    timestamps: true,
  }
);

const logoModel = mongoose.model("logos", logoSchema);
module.exports = logoModel;
