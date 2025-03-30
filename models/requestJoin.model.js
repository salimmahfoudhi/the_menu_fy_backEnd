const mongoose = require('mongoose')

const ERole = {
  resRestaurant : 'responsable',
};
const AStatus = {
    inProgress :'in progress',
    accepted :'accepted',
    refused : 'refused',
}
const requestJoindSchema = new mongoose.Schema({
  // ----------- user data -------------------
    firstName : {type: String},
    lastName : {type: String},   
    phone : {type: String}, 
    email : {type: String}, 
    proof : {type:String},  
  // ----------- resto data -------------------
    name: {type: String},
    cuisineType: {type: String},
    address : {type: String},
    role: {type: String,  enum: Object.values(ERole)},
    status : {type: String, enum: Object.values(AStatus)},    
  },{ versionKey: false, timestamps: true }
  );
const requestJoindModel = mongoose.model("request_join",requestJoindSchema)
module.exports = requestJoindModel;