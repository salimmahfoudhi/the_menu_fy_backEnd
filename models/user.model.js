const mongoose = require('mongoose')

const ERole = {
  superAdmin: 'superAdmin',
  resFranchise : 'resFranchise',
  resRestaurant : 'responsable',
  client: 'client',
  preparator: 'preparator',
  server: 'server',
  accueil: 'accueil',
  employee :'employee'
};
const userSchema = new mongoose.Schema({
    firstName : {type: String}, 
    lastName : {type: String},
    phoneVerified: { type: Boolean, default: false },
    userName: {type: String},
    image : {type: String},
    address : {type: String},
    phone : {type: String},
    email : {type: String, unique: true},
    password:{type:String},   
    birthday: {type:String},
    help: {type: Boolean},
    activate:{type:Boolean},
    role: {type: String,  enum: Object.values(ERole)},
    firstLogin:{type: Boolean},
    provider : {type: String},
    proof:{type:String},
    statusarchieve:{type : Boolean},
    allergies: [{type : String}],
    verificationCode: { type: String }, // Ajout du champ de code de vérification
    restaurantFK : {type: mongoose.Schema.Types.ObjectId,ref: 'Restaurant'},
    franchiseFK : {type: mongoose.Schema.Types.ObjectId,ref: 'Franchise'},   
    wishList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
  },{ versionKey: false, timestamps: true }
  );
const userModel = mongoose.model("user",userSchema)
module.exports = userModel;