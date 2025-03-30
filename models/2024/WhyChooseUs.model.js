const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const whyChooseUsSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  number : {
    type: Number,
    required: true
  }
});

const WhyChooseUs = mongoose.model('WhyChooseUs', whyChooseUsSchema);

module.exports = WhyChooseUs;
