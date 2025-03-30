const mongoose = require("mongoose");

const linkSchema = new mongoose.Schema(
  {
    link: { type: String },
    active: { type: Boolean, default: true }, 
  },
  {
    timestamps: true,
  }
);

const linkModel = mongoose.model("links", linkSchema);
module.exports = linkModel;
