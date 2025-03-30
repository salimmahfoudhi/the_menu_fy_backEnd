const mongoose = require('mongoose')

const tableSchema = new mongoose.Schema({
    tableNb : {type: Number},
    chairNb : {type: Number},
    qr : {type: String},
    restaurant : {type: mongoose.Schema.Types.ObjectId,ref: 'Restaurant'},
    user: {  type: mongoose.Schema.Types.ObjectId, ref: "user" },
    createdAt: { type: Date, default: Date.now }

});

const tableModel = mongoose.model("table",tableSchema)
module.exports = tableModel;