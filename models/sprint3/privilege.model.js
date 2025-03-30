const mongoose = require("mongoose");

const privilegeSchema = new mongoose.Schema(
  {
    user_management: { type: Boolean, default: 0 },
    table_management: { type: Boolean, default: 0 },
    print_qr: { type: Boolean, default: 0 },
    consulter_historique: { type: Boolean, default: 0 },
    traiter_cmd: { type: Boolean, default: 0 },
    update_delay_waiting: { type: Boolean, default: 0 },
    livrer_cmd: { type: Boolean, default: 0 },
    paid_cash: { type: Boolean, default: 0 },
    consulter_comments: { type: Boolean, default: 0 },
    traiter_comments: { type: Boolean, default: 0 },
    consulter_help_request: { type: Boolean, default: 0 },
    consulter_historique_help_request: { type: Boolean, default: 0 },
    traiter_help_request: { type: Boolean, default: 0 },

    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  }, { timestamps: true }
);

const privilegeModel = mongoose.model("Privilege", privilegeSchema);
module.exports = privilegeModel;