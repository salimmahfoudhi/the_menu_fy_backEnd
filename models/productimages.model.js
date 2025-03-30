const mongoose = require('mongoose');

const productimagesschema = new mongoose.Schema({
    photo_ : {type : String},
    productFK : {type : mongoose.Schema.Types.ObjectId, ref:"Product"}
},{
    timestamps: true
});

const productimagesmodel = mongoose.model("productimages", productimagesschema);
module.exports = productimagesmodel;