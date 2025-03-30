const app = require('express').Router();
const _ = require('../../controllers/sprint2/stripe.controller');
const stripe = require('stripe')( process.env.STRIPE_KEY);

app.post('/stripe/:userId', _.stripe);
app.post('/refund/:userId', _.refund);
app.post('/tips/:userId/:amountTips', _.stripeTipsPayment);
app.post('/create-payment-intent', async (req, res) => {
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

app.post('/create', _.stripe);
app.post('/stripe/:userId', _.stripe);
app.post('/refund/:userId', _.refund);
app.post('/tips/:userId/:amountTips', _.stripeTipsPayment);
app.post('/pay/tips/order', _.stripeTipsPayment);
module.exports = app;   
