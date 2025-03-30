const mongoose = require('mongoose');

const gifproductschema = new mongoose.Schema({
    photo : {type : String},
    productFK : {type : mongoose.Schema.Types.ObjectId, ref:"Product"}
},{
    timestamps: true
});

const gifproductmodel = mongoose.model("gifproduct", gifproductschema);
module.exports = gifproductmodel;