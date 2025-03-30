const mongoose = require('mongoose')


const contactSchema = new mongoose.Schema({
  
    phone : {type: String},
    email : {type: String},
    adresse : {type: String},
    localisation: {
      type: [Number],
      required: false,
      default: [0, 0],
  }
   },{ versionKey: false, timestamps: true }
  );
const contactModel = mongoose.model("contact",contactSchema)
module.exports = contactModel;