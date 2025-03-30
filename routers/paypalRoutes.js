const express = require('express');
const { createOrder, capturePayment } = require('../controllers/paypalController');
const router = express.Router();

router.post('/create-order', createOrder);
router.get('/complete-order', capturePayment); 

module.exports = router;
