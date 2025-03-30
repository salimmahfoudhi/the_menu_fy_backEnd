const mongoose = require("mongoose");

const commentsAvisSchema = new mongoose.Schema(
  {
    comment : {type: String, default:""},
    date : {type :Date, default : Date.now},

    restaurantFK: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    avisFK: { type: mongoose.Schema.Types.ObjectId, ref: "Avis" }
  }, { timestamps: true }
);

const commetnsAvisModel = mongoose.model("Comment_Avis", commentsAvisSchema);
module.exports = commetnsAvisModel;