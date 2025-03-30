const mongoose = require('mongoose');
const userModel = require('./user.model'); 
const employeeSchema = new mongoose.Schema({
   // department: { type: String, default: '15' },  // ... (other employee-specific fields)
   owner : {type: mongoose.Schema.Types.ObjectId,ref: 'user', unique: true}, //unique: true : pour
   createdAt: { type: Date, default: Date.now }

});

const EmployeeModel = userModel.discriminator('employee', employeeSchema);

module.exports = EmployeeModel;
