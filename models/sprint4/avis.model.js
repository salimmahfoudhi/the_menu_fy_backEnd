const mongoose = require("mongoose");

const avisSchema = new mongoose.Schema(
  {
   
    comment : {type: String, default:""},
    note : {type: Number},
    date : {type :Date, default : Date.now},
    response : {type: String, default:""},
    orderFK : { type: mongoose.Schema.Types.ObjectId, ref: "Order", },
    restaurantFK: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },

    
  }, { timestamps: true }
);

const avisModel = mongoose.model("Avis", avisSchema);
module.exports = avisModel;