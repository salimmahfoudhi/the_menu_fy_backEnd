const express = require('express');
const router = express.Router();
const avisController = require ("../../controllers/sprint4/avis.controller")
const Review = require('../../models/sprint4/avis.model'); // Assurez-vous d'importer correctement votre modèle d'avis

router.post('/add/avis', avisController.addAvis);
router.get('/getAllAvis', avisController.getAllAvis);
router.get('/getById/:id', avisController.getAvisById);
router.get('/avis/:userId', avisController.getAllAvisweb);
router.get('/getByUser', avisController.getAvisByUser);
router.put('/responseAvis/:id', avisController.responseAvis);
router.post('/addComment/:idAvis', avisController.addCommentToAvis)
router.get('/getComments/:idAvis', avisController.getCommentsByAvis)
router.get('/restaurant/:restaurantId', avisController.getReviewsByRestaurant);
router.post('/resturant/:userId', avisController.addAvisWeb);
router.get('/getAllAvisByResturantPagination', avisController.getAllAvisByResturantPagination);
router.get('/check/:userId/:orderId', async (req, res) => {
    const { userId, orderId } = req.params;

    try {
      // Check if there's a review for the specific order by this user
      const review = await Review.findOne({ user: userId, order: orderId });

      if (review) {
        res.status(200).json({ hasReviewed: true, review });
      } else {
        res.status(200).json({ hasReviewed: false });
      }
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while checking review status.' });
    }
});

module.exports = router;