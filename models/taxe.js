const mongoose = require('mongoose');



const taxeSchema = new mongoose.Schema({

  region: { type: String, unique: true},  
            taxeTPS: { type: String},
            taxeTVQ: { type: String},


  date: { type: Date, default: Date.now }
});


module.exports = mongoose.model('Taxe', taxeSchema);
