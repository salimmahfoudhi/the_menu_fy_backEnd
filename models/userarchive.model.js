const mongoose = require('mongoose');

const userArchiveSchema = new mongoose.Schema({
  firstName: { type: String },
  lastName: { type: String },
  userName: { type: String },
  image: { type: String },
  address: { type: String },
  phone: { type: String },
  email: { type: String },
  role: { type: String }, 
}, { versionKey: false, timestamps: true });

const UserArchive = mongoose.model('userarchive', userArchiveSchema);

module.exports = UserArchive;