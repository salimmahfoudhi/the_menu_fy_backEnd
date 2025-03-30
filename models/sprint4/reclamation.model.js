const mongoose = require("mongoose");

const reclamationSchema = new mongoose.Schema(
  {
    type : {type :String, default :""},
    message : {type :String, default :"I want to claim"},
    response : {type :String, default :""},
    image : {type :String, default :""},
    statusReclamation : {type :Boolean},
    tableNb : {type: String, default:""},
    date : {type :Date, default : Date.now},
    orderFK : { type: mongoose.Schema.Types.ObjectId, ref: "Order", },
    restaurantFK: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  }, { timestamps: true }
);

const reclamationModel = mongoose.model("Reclamation", reclamationSchema);
module.exports = reclamationModel;