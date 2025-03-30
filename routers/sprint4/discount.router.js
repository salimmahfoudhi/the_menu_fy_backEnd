
const express = require('express');
const router = express.Router();
const { getDiscount, createDiscount,getDiscountPagination ,deleteById,updateDiscountById} = require('../../controllers/sprint4/discount.controller');

router.post('/getDiscount', getDiscount);
router.post('/createDiscount', createDiscount);
router.get('/getDiscountPagination', getDiscountPagination);
router.delete('/deleteById/:id',deleteById);
router.put('/update/:id',updateDiscountById);



module.exports = router;
