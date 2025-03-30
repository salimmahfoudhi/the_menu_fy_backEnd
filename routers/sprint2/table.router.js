const express = require('express');
const router = express.Router();
const cookieParser = require("cookie-parser");

const tableController = require('../../controllers/sprint2/table.controller');
router.use(cookieParser());

router.post('/addNewTable/:restaurant', tableController.AddNewTable);
router.get('/getTables',tableController.getTables);
router.get('/getTablebyId/:id',tableController.getTablebyId);
router.put('/update/:id',tableController.updateTableById);
router.get('/getTablesPagination',tableController.getTablesPagination);
router.post('/AddNewTableQrCode', tableController.AddNewTableQrCode);
router.delete('/deleteById/:id',tableController.deleteById);




module.exports = router;