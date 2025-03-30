const mongoose = require('mongoose');

const socialnetSchema = new mongoose.Schema(
  {
    facebook: { type: String },
    instagram: { type: String },
    linkedin: { type: String },
    twitter: { type: String },
    active: { type: Boolean, default: true }, 
  },
  {
    timestamps: true,
  }
);

const socialnet = mongoose.model('Socialnets', socialnetSchema);
module.exports = socialnet;
