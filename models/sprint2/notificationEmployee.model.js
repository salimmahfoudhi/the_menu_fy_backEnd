const mongoose = require("mongoose");
const moment = require('moment');

const notificationEmployeeSchema = new mongoose.Schema(
  {
    orderFK: [{type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
    helpRequestFK: [{type: mongoose.Schema.Types.ObjectId, ref: "help_request" }],
    userFK : {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    userSource : {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    reclamationFK : {type: mongoose.Schema.Types.ObjectId, ref: "Reclamation"},
    title : {type: String},
    body: {type: String},
    date : {type : Date, default : moment()},
   
  },{versionKey: false, timestamps: true}
);

const notificationEmployeeModel = mongoose.model("Notification_employee", notificationEmployeeSchema);
module.exports = notificationEmployeeModel;
