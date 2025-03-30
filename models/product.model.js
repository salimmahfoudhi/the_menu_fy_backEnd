const mongoose = require ('mongoose');

const productSchema = new mongoose.Schema({
    name : {type: String},
    photo : {type:String},
    description : {type:String},
    price : {type: Number,default:0},
    disponibility : {type: String, default:'Yes'},
    disponibilityDuration : {type: Number, required:false},
    promotion : {type: Number,required:false, default:0},
    visibility : {type: String, default:'ENABLE'},
    categoryFK : {type: mongoose.Schema.Types.ObjectId, ref:"Category"},
    preparationDuration : {type: Number,default:0}
   
},{
    timestamps:true
});

const productModel = mongoose.model("Product", productSchema);
module.exports = productModel;
