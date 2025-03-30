const mongoose = require('mongoose');

const archivedCRMSASchema = new mongoose.Schema(
  {
    field: { type: String },
    value: { type: mongoose.Schema.Types.Mixed },
    socialnet: { type: mongoose.Schema.Types.ObjectId, ref: 'Socialnet' },
  },
  {
    timestamps: true,
  }
);

const ArchivedCRMSA = mongoose.model('ArchivedCRMSA', archivedCRMSASchema);
module.exports = ArchivedCRMSA;
