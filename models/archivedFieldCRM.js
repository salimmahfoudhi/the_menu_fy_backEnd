const mongoose = require('mongoose');



const archivedFieldCRMSchema = new mongoose.Schema({

  nameRes: { type: String},  
  address: { type: String},
  logo: {type: String},
  promotion: {type: String},
  facebookLink: {type : String},
  twitterLink: {type : String},
  instagramLink: {type : String},
  tiktokLink: {type : String},
  phone: {type : String},
  email:{type : String},


  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
  archivedAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('ArchivedFieldCRM', archivedFieldCRMSchema);
