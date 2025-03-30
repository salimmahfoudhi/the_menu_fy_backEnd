const mongoose = require('mongoose');

const paiementSchema = new mongoose.Schema({
  
  numCart: { type: String},  
  statusPay: {type: Boolean, default : false},
  archive:{ type: Boolean, default: false },
  payMethod:{type : String},
  cash: {type : String},
  status: {type : String},
  methodePay: {type : String},
  createdAt: { type: Date, default: Date.now },
  
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user'},
  restaurantFK : {type: mongoose.Schema.Types.ObjectId,ref: 'Restaurant'},
});

module.exports = mongoose.model('Paiement', paiementSchema);