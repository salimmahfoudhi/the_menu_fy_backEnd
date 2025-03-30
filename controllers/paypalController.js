const paypal = require('@paypal/checkout-server-sdk');
const Order = require('../models/sprint2/order.model');
const CartOrder = require('../models/sprint2/cartOrder.model');
require('dotenv').config();

function environment() {
    let clientId = process.env.PAYPAL_CLIENT_ID;
    let clientSecret = process.env.PAYPAL_SECRET;

    return new paypal.core.SandboxEnvironment(clientId, clientSecret);
}

function client() {
    return new paypal.core.PayPalHttpClient(environment());
}

exports.createOrder = async (req, res) => {
    const { amount, cartOrderId } = req.body;

    try {
        const cartOrder = await CartOrder.findById(cartOrderId);
        if (!cartOrder) {
            return res.status(404).json({ error: "CartOrder not found" });
        }

        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer("return=representation");
        const requestBody = {
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: 'USD',
                    value: amount,
                    breakdown: {
                        item_total: {
                            currency_code: 'USD',
                            value: amount
                        }
                    }
                }
            }],
            application_context: {
                return_url: `${process.env.BASE_URL}/paypal/complete-order`,
                cancel_url: `${process.env.BASE_URL}/paypal/cancel-order`,
                shipping_preference: 'NO_SHIPPING',
                user_action: 'PAY_NOW',
                brand_name: 'Your Brand Name'
            }
        };
        request.requestBody(requestBody);

        console.log('Request Body:', JSON.stringify(requestBody, null, 2));

        const response = await client().execute(request);

        console.log('PayPal Create Order Response:', response.result);
        const latestOrder = await Order.findOne().sort({ createdAt: -1 });
        const latestOrderNb = latestOrder ? latestOrder.orderNb : 0;
        const orderNb = latestOrderNb + 1;
        const newOrder = new Order({
            cartOrderFK: cartOrder._id,
            user: cartOrder.user,
            restaurantFK: cartOrder.restaurantFK,
            tableNb: cartOrder.tableNb,
            orderNb: orderNb,
            totalPrice: amount,
            payment_intent: response.result.id,
            payMethod: 'paypal',
            statusPay: true,
            statusOrder:"Waiting"
        });

        await newOrder.save();

        const approvalUrl = response.result.links.find(link => link.rel === 'approve').href;
        res.status(201).json({
            id: response.result.id,
            orderId: newOrder._id,
            approvalUrl: approvalUrl
        });
    } catch (error) {
        console.error("Error creating PayPal order:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: error.message });
    }
}

exports.capturePayment = async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ error: "Token is required" });
    }

    try {
        const request = new paypal.orders.OrdersCaptureRequest(token);
        request.requestBody({});

        const response = await client().execute(request);

        const order = await Order.findOne({ payment_intent: token }).populate('cartOrderFK');
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        order.statusPay = true;
        order.payMethod = 'paypal';
        await order.save();

        const cartOrder = await CartOrder.findById(order.cartOrderFK);
        if (cartOrder) {
            cartOrder.statusPay = true;
            await cartOrder.save();
        }

        res.status(200).json({
            status: "success",
            capture: response.result
        });
        
    } catch (error) {
        console.error("Error capturing PayPal order:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: error.message });
    }
}
