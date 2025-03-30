const mongoose = require ('mongoose');

const menuSchema = new mongoose.Schema({
    name : {type: String, required:true, unique:true},
    visibility:{type: String, default:'ENABLE'},
    restaurantFK : {type: mongoose.Schema.Types.ObjectId, ref:"Restaurant"},
    franchiseFK : {type: mongoose.Schema.Types.ObjectId, ref:"Franchise"}

},{
    timestamps:true
});

const menuModel = mongoose.model("Menu", menuSchema);
module.exports = menuModel;
    