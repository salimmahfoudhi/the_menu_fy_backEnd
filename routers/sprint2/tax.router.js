const express = require('express');
const router = express.Router();
const cookieParser = require("cookie-parser");
const taxController = require('../../controllers/sprint2/tax.controller')

router.use(cookieParser());

router.post('/addTax', taxController.addTax);
router.put('/editTaxById/:id', taxController.editTaxById);
router.put('/hideTax/:id', taxController.hideTax);
router.put('/activateTax/:id', taxController.activateTax);
router.get('/getTaxs', taxController.getTaxs);
router.get('/getTaxById/:id', taxController.getTaxById);
router.get('/getActivateTaxs', taxController.getActivateTaxs); //'/getActivateTaxs/:id'

module.exports = router;