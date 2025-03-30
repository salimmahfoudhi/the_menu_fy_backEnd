const express = require('express');
const stripe = require('stripe')( process.env.STRIPE_KEY);
const router = express.Router();
const {
    createAbonnementfr,
    getAllAbonnementfrs,
    getAbonnementfrById,
    updateAbonnementfr,
    deleteAbonnementfr,
    archiveAbonnementfr,
    toggleAbonnementfr,
    assignAbonnement,
    getAvailableAbonnements,
    getFranchiseDetails,
    getUpgradeOptions
} = require('../controllers/abonnementfr.controller');

router.post('/', createAbonnementfr);
router.get('/', getAllAbonnementfrs);
router.get('/:id', getAbonnementfrById);
router.put('/:id', updateAbonnementfr);
router.delete('/:id', deleteAbonnementfr);
router.patch('/archive/:id', archiveAbonnementfr);
router.patch('/toggle/:id', toggleAbonnementfr);
router.get('/upgrade-options/:franchiseId', getUpgradeOptions);

router.post('/:franchiseId/assign-abonnement/:abonnementId', assignAbonnement);

router.get('/abonnements/available/:franchiseId', getAvailableAbonnements);

router.get('/franchise/:franchiseId', getFranchiseDetails);

router.post('/create-payment-intent', async (req, res) => {
  const { amount } = req.body;
  
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
    
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});


module.exports = router;
