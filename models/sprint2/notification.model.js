const mongoose = require("mongoose");
const moment = require('moment');

const notificationSchema = new mongoose.Schema(
  {
    orderFK: [{type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
    userSended : {type: mongoose.Schema.Types.ObjectId, ref: "user"},
    userConcerned : {type: mongoose.Schema.Types.ObjectId, ref: "user"},
    restaurantFK : {type: mongoose.Schema.Types.ObjectId, ref: "Restaurant"},
    title : {type: String},
    body: {type: String},
    suggestion: {type: String},
    date : {type : Date, default : moment()},
    userSended : {type: mongoose.Schema.Types.ObjectId, ref: "user"},
  },{versionKey: false, timestamps: true}
);

const notificationModel = mongoose.model("Notification", notificationSchema);
module.exports = notificationModel;

