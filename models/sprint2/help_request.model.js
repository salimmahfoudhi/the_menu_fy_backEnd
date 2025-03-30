const mongoose = require('mongoose')

const help_requestSchema = new mongoose.Schema({
    date : {type: Date, default: Date.now},
    etat : {type: Boolean},
    tableNb: {type: String},
    note: {type : String},
    type: {type : String},
    noteEmployee : {type : String, default : ""},
    user : {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    table : {type: mongoose.Schema.Types.ObjectId,ref: 'table'},
    restaurantFK : {type: mongoose.Schema.Types.ObjectId,ref: 'Restaurant'},
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },

    
},{ versionKey: false, timestamps: true }
);

const help_requestModel = mongoose.model("help_request",help_requestSchema)
module.exports = help_requestModel;