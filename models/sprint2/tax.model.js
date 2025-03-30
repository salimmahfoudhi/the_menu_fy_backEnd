const mongoose = require('mongoose')

const taxSchema = new mongoose.Schema({

    typeTax: {type: String},
    title : {type: String},
    idNumber : {type: Number},
    address : {type: String},
    phoneNumber : {type: String},
    activate : {type: Boolean},

    user : {type: mongoose.Schema.Types.ObjectId,ref: 'user'},
});

const taxModel = mongoose.model("tax",taxSchema)
module.exports = taxModel;