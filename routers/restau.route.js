const express = require('express');
const router = express.Router();
const restauController = require('../controllers/restau.controller');
const verifyToken = require('../middleware/Auth');
// Apply middleware to the resto endpoint
router.get('/resto', verifyToken, restauController.getAllResto);

router.post('/', restauController.createRestaurant);
router.get('/', restauController.getAllRestaurants);
router.get('/:id', restauController.getRestaurantById);
router.put('/:id', restauController.updateRestaurant);
router.delete('/:id', restauController.deleteRestaurant);
router.get('/ab/noarchive', restauController.getNonArchivedRestaurants);
router.get('/ab/archived', restauController.getArchRestaurants);

module.exports = router;
