const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  nameRes: { type: String},  
  address: { type: String},
  cuisineType: {type: String},
  taxeTPS: { type: String},
  taxeTVQ: { type: String},
  color: { type: String},
  logo: {type: String},
  images: {type:String},
  promotion: {type: String},
  payCashMethod: {type : String},
  payCartMethod: {type : String},
  longitude:  {type : Number},
  latitude: {type : Number},
  facebookLink: {type : String},
  twitterLink: {type : String},
  instagramLink: {type : String},
  tiktokLink: {type : String},
  phone: {type : String},
  email:{type : String, unique: true},
  archive:{ type: Boolean, default: false },
  payMethod:{type : String},
  TPS: { type: String},
  TVQ: { type: String},

  phoneFacture:{ type: Boolean, default: false },
  addressFacture:{ type: Boolean, default: false },
  taxeTPSFacture:{ type: Boolean, default: false },
  taxeTVQFacture:{ type: Boolean, default: false },
  TPSFacture:{ type: Boolean, default: false },
  TVQFacture:{ type: Boolean, default: false },
  countrie: { type: String},

  workes: {
    type: [
      {
        day: String,
        startWorkes: String,
        endWorkes: String
      }
    ],
    default: [
      { day: 'Monday', startWorkes: '00:00', endWorkes: '00:00' },
      { day: 'Tuesday', startWorkes: '00:00', endWorkes: '00:00' },
      { day: 'Wednesday', startWorkes: '00:00', endWorkes: '00:00' },
      { day: 'Thursday', startWorkes: '00:00', endWorkes: '00:00' },
      { day: 'Friday', startWorkes: '00:00', endWorkes: '00:00' },
      { day: 'Saturday', startWorkes: '00:00', endWorkes: '00:00' },
      { day: 'Sunday', startWorkes: '00:00', endWorkes: '00:00' }
    ]
  },


  


  taxe: { type: String, required: false, ref: 'Taxe' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'user'},
  table : {type: mongoose.Schema.Types.ObjectId,ref: 'Table'},
  menu: {type: mongoose.Schema.Types.ObjectId,ref: 'Menu' },
  franchiseFK : {type: mongoose.Schema.Types.ObjectId,ref: 'Franchise'},
//  categories: [{type: mongoose.Schema.Types.ObjectId,ref: 'Category',}],
phoneFacture:{ type: Boolean, default: false },
  addressFacture:{ type: Boolean, default: false },
  taxeTPSFacture:{ type: Boolean, default: false },
  taxeTVQFacture:{ type: Boolean, default: false },
  TPSFacture:{ type: Boolean, default: false },
  TVQFacture:{ type: Boolean, default: false },
  status: {
    type: String,
    
  }
});

module.exports = mongoose.model('Restaurant', restaurantSchema);