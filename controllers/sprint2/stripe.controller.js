const Order = require('../../models/sprint2/order.model');
const stripe = require('stripe')( process.env.STRIPE_KEY);
const jwt_decode = require("jwt-decode");

const StripeController = {

  stripe: async (req, res) => {
    const tokenLogin = req.cookies.tokenLogin;
    const decodeTokenLogin = jwt_decode(tokenLogin);
    const idUser = decodeTokenLogin.id;

    try {
      // Moved inside try block to catch potential errors
      const order = await Order.findOne({ user: idUser }).sort({ createdAt: -1 }).populate('user').populate({
        path: 'restaurantFK',
        populate: [
          { path: 'owner' },
        ]
      });

      const emailUser = order.user.email;
      const restaurantFKEmail = order.restaurantFK.owner.email;

      if (!restaurantFKEmail) {
        // Changed to return JSON response
        return res.status(500).json({ error: "Email Not Found" });
      }

      const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: {
          number: "4242424242424242",
          exp_month: 9,
          exp_year: 24,
          cvc: "123",
        },
      });

      const customer = await stripe.customers.create({
        email: emailUser,
        payment_method: paymentMethod.id,
        invoice_settings: {
          default_payment_method: paymentMethod.id,
        },
      });

      const ephemeralKey = await stripe.ephemeralKeys.create(
        { customer: customer.id },
        { apiVersion: '2022-11-15' }
      );

      const amountInCents = Math.round(order.totalPrice * 100);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'usd',
        customer: customer.id,
        payment_method_types: ['card'],
      });

      // Ensure response is JSON
      res.json({
        paymentIntent: paymentIntent.client_secret,
        ephemeralKey: ephemeralKey.secret,
        customer: customer.id,
        publishableKey: process.env.PUBLISH_STRIPE_KEY,
      });

      // Use await to ensure order is saved before finishing
      order.payment_intent = paymentIntent.id;
      await order.save();

    } catch (error) {
      console.error('Error processing payment:', error);
      // Changed to return JSON response
      res.status(500).json({ error: 'Payment failed' });
    }
  },

  refund: async (req, res) => {
    
    try {
      const tokenLogin = req.cookies.tokenLogin;
      const decodeTokenLogin = jwt_decode(tokenLogin);
      const idUser = decodeTokenLogin.id;
  
      const order = await Order.findOne({ user: idUser, statusOrder:'Canceled' }).sort({ updatedAt: -1}).populate('user');

      const amountInCents = Math.round(order.totalPrice * 100);
    if(order.payMethod === "Credit card") {

      if (order.statusRefunded) {
        return res.status(400).json({ message: 'La commande a déjà été remboursée' });
      }

      const refund = await stripe.refunds.create({
        payment_intent: order.payment_intent,
        amount: amountInCents,
      });
  
      if (refund.status === 'succeeded') {
        res.status(200).json({ message: 'Remboursement réussi !' });
        order.statusRefunded =true;
        order.save();
      } else {
        res.status(400).json({ message: 'Échec du remboursement ', failure_reason: refund.failure_reason });
      }
    }else {
      res.status(500).json({ message: 'Pay method not equal to Credit Card' });
    }
    } catch (error) {
      console.error('Erreur lors du remboursement : ', error);
      res.status(500).json({ message: 'Erreur lors du remboursement' });
    }
  },
  
 
   stripeTipsPayment : async (req, res) => {
    try {
        const { userId, amountTips } = req.params;

        // Find the latest order for the user
        const order = await Order.findOne({ user: userId }).sort({ dateAvis: -1 }).populate('user').populate('restaurantFK');

        // Check if the order exists
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Create a payment method
        const paymentMethod = await stripe.paymentMethods.create({
            type: 'card',
            card: {
                number: "4242424242424242",
                exp_month: 9,
                exp_year: 24,
                cvc: "123",
            },
        });

        // Create a customer
        const customer = await stripe.customers.create({
            email: order.user.email,
            payment_method: paymentMethod.id,
            invoice_settings: {
                default_payment_method: paymentMethod.id,
            },
        });

        // Create an ephemeral key for the customer
        const ephemeralKey = await stripe.ephemeralKeys.create(
            { customer: customer.id },
            { apiVersion: '2022-11-15' }
        );

        // Convert amountTips to cents
        const amountInCents = Math.round(amountTips * 100);

        // Create a payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: 'usd',
            customer: customer.id,
            payment_method_types: ['card'],
        });

        // Respond with payment details
        res.json({
            paymentIntent: paymentIntent.client_secret,
            ephemeralKey: ephemeralKey.secret,
            customer: customer.id,
            publishableKey: process.env.PUBLISH_STRIPE_KEY,
        });

        // Update order with tip details
        order.statusTips = true;
        order.statusMethodTips = "Credit Card";
        order.dateAvis = order.dateAvis;
        order.amountTips = amountTips;
        await order.save();

    } catch (error) {
        console.error('Error processing tip payment:', error);
        res.status(500).json({ error: 'Payment failed' });
    }
},
}

  



module.exports = StripeController;