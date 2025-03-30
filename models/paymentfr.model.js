const mongoose = require('mongoose');
const paymentfrSchema = new mongoose.Schema({
    statusPay: {type: Boolean, default : false},
    franchiseFK : {type: mongoose.Schema.Types.ObjectId,ref: 'Franchise'},

  abonnement: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Abonnementfr',
    default: null 
  }
});

module.exports = mongoose.model('Payment', paymentfrSchema);
