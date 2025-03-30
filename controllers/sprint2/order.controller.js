const jwt_decode = require("jwt-decode");
const RandomString = require("randomstring");
const Order = require('../../models/sprint2/order.model')
const User = require('../../models/user.model')
const CartOrder = require('../../models/sprint2/cartOrder.model');
const CartTrash = require('../../models/sprint2/cartTrash.model');
const Notification = require('../../models/sprint2/notification.model');
const NotificationEmployee = require('../../models/sprint2/notificationEmployee.model');
const nodemailer = require("nodemailer");
const moment = require('moment')
const invoice = require('../../utils/config/invoice');
const invoiceCreditCard = require('../../utils/config/invoiceCreditCard');
const mongoose = require('mongoose')
const Restaurant = require('../../models/restaurant.model')
const Product = require('../../models/product.model');
const Ingredient = require('../../models/ingredient.model');
const Item = require('../../models/item.model');
const stripe = require('stripe')(process.env.STRIPE_KEY);
const player = require('play-sound')();
const notificationSoundFile = '../../utils/audio/notif.mp3';
const orderModel = require("../../models/sprint2/order.model");
const paypalClient = require("../../utils/config/paypalconfig")
const paypal = require('@paypal/checkout-server-sdk');



// --------------- Email send -------------------
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: `${process.env.EMAIL}`,
        pass: `${process.env.PASSWORD}`,
    },
});
// ---------- find Restaurant By OwnerId --------------
async function findRestaurantByOwnerId(ownerId) {
    try {
        const restaurant = await Restaurant.findOne({ owner: ownerId }).populate('owner');
        return restaurant;
    } catch (error) {
        console.error('Error finding restaurant by owner ID:', error);
        throw error;
    }
}

//------------complited order -----------------
const scheduleComplitedOrder = (orderStatus, timeInMinutes) => {
    setTimeout(async () => {
        try {
            if (!orderStatus) {
                console.log("Order not found");
                return;
            }
            orderStatus.statusOrder = "Ready";
            // Update other fields as needed

            const newNotification = new Notification({
                userConcerned: orderStatus.user,
                orderFK: orderStatus._id,
                title: "Ready",
                body: `Your order ${orderStatus.orderNb} will be ready very soon!`
            });
            const savedNotification = await newNotification.save();
            const savedStatus = await orderStatus.save();
            console.log("Order Ready and notification sent successfully");
        } catch (error) {
            console.error("Error completing order:", error);
        }
    }, timeInMinutes * 60 * 1000); // Convert minutes to milliseconds
};


const orderController = {

     addOrder: async (req, res) => {
        let total = 0;
        let convertPromotion = 0;
        let convertedPrice = 0;
        let convertedPriceTPS = 0;
        let convertPriceTVQ = 0;
    
        try {
            const tokenLogin = req.cookies.tokenLogin;
            const decodeTokenLogin = jwt_decode(tokenLogin);
            const idUser = decodeTokenLogin.id;
    
            const cartData = await CartOrder
                .findOne({ user: idUser }).sort({ createdAt: -1 })
                .populate("productFK")
                .populate("ingredientFK")
                .populate('itemsFK');
    
            if (!cartData) {
                return res.status(404).json({ message: "Cart data not found" });
            }
    
            const restaurantId = cartData.restaurantFK;
            const restaurant = await Restaurant.findOne({ "_id": restaurantId });
    
            if (!restaurant) {
                return res.status(404).json({ message: "Restaurant not found" });
            }
    
            convertTPS = restaurant.taxeTPS / 100;
            convertTVQ = restaurant.taxeTVQ / 100;
    
            for (let i = 0; i < cartData.productFK.length; i++) {
                let product = cartData.productFK[i];
                let quantity = cartData.quantityProduct[i];
                let item = cartData.itemsFK[i] || { price: 0 };
    
                if (product.promotion === 0 || (cartData.ingredientFK[i]?.type === 'Required')) {
                    let itemTotal = product.price * quantity;
                    convertedPriceTPS = itemTotal * convertTPS;
                    convertPriceTVQ = itemTotal * convertTVQ;
                    total += (itemTotal + convertedPriceTPS + convertPriceTVQ);
                } else {
                    convertPromotion = product.promotion / 100;
                    convertedPrice = product.price * convertPromotion;
                    let productPrice = product.price - convertedPrice;
                    let productItemPrice = productPrice + item.price;
    
                    let itemTotal = productPrice * quantity + item.price;
                    convertedPriceTPS = itemTotal * convertTPS;
                    convertPriceTVQ = itemTotal * convertTVQ;
                    total += (itemTotal + convertedPriceTPS + convertPriceTVQ);
                }
            }
    
            const latestOrder = await Order.findOne().sort({ createdAt: -1 });
            const latestOrderNb = latestOrder ? latestOrder.orderNb : 0;
            const orderNb = latestOrderNb + 1;
    
            const { tableNb, payMethod, restaurantFK, taxFK, allergy, discountPercentage } = req.body;
            if (discountPercentage && discountPercentage > 0) {
                const discountAmount = total * (discountPercentage / 100);
                total -= discountAmount;
            }
    
            const newOrder = new Order({
                cartOrderFK: cartData,
                user: new mongoose.Types.ObjectId(idUser),
                statusOrder: "Waiting",
                tableNb: tableNb,
                orderNb: orderNb,
                totalPrice: total.toFixed(2),
                payMethod: payMethod,
                restaurantFK: restaurantFK,
                taxFK: taxFK,
                allergyName: allergy,
                statusCancelRequest: "No cancel request"
            });
    
            await newOrder.save();
    
            const newNotification = new Notification({
                userSended: idUser,
                userConcerned: restaurant.owner,
                title: "New order",
                body: `New order received from table N° ${tableNb}.`
            });
            await newNotification.save();
    
            await CartTrash.find({ user: idUser }).deleteMany();
    
            return res.status(200).json({ data: newOrder });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },
    
    addOrderweb: async (req, res) => {
        let total = 0;
        let convertPromotion = 0;
        let convertedPrice = 0;
        let convertedPriceTPS = 0; // Initialize here
        let convertPriceTVQ = 0; // Initialize here
        try {
            const { userId } = req.params;

            if (!userId) {
                return res.status(400).json({ message: "User ID is required" });
            }

            const userObjectId = new mongoose.Types.ObjectId(userId);

            const cartData = await CartOrder
                .findOne({ user: userObjectId }).sort({ createdAt: -1 })
                .populate("productFK")
                .populate("ingredientFK")
                .populate('itemsFK');
                

            if (!cartData) {
                return res.status(404).json({ message: "Cart is empty" });
            }

            const restaurantId = cartData.restaurantFK;
            const restaurant = await Restaurant.findOne({ "_id": restaurantId });
            const convertTPS = restaurant ? restaurant.taxeTPS / 100 : 0;
            const convertTVQ = restaurant ? restaurant.taxeTVQ / 100 : 0;

            if (cartData) {
                for (let i = 0; i < cartData.productFK.length; i++) {
                    if (cartData.productFK[i].promotion === 0 || cartData.ingredientFK[i]?.type === 'Required') {
                        let itemTotal = cartData.productFK[i].price * cartData.quantityProduct[i];
                        convertedPriceTPS = itemTotal * convertTPS;
                        convertPriceTVQ = itemTotal * convertTVQ;
                        total += (itemTotal + convertedPriceTPS + convertPriceTVQ);
                    } else {
                        convertPromotion = cartData.productFK[i].promotion / 100;
                        convertedPrice = cartData.productFK[i].price * convertPromotion;
                        let productPrice = cartData.productFK[i].price - convertedPrice;
                        let productItemPrice = productPrice + (cartData.itefmsFK[i]?.price || 0);

                        if (cartData.itemsFK[i]) {
                            let itemTotal = productPrice * cartData.quantityProduct[i] + cartData.itemsFK[i].price;
                            convertedPriceTPS = itemTotal * convertTPS;
                            convertPriceTVQ = itemTotal * convertTVQ;
                            total += (itemTotal + convertedPriceTPS + convertPriceTVQ);
                        } else {
                            let itemTotal = productPrice * cartData.quantityProduct[i];
                            convertedPriceTPS = itemTotal * convertTPS;
                            convertPriceTVQ = itemTotal * convertTVQ;
                            total += (itemTotal + convertedPriceTPS + convertPriceTVQ);
                        }
                    }
                }
            }
            

            const latestOrder = await Order.findOne().sort({ createdAt: -1 });
            const latestOrderNb = latestOrder ? latestOrder.orderNb : 0;
            const orderNb = latestOrderNb + 1;

            const { tableNb, payMethod, restaurantFK, taxFK, allergy,discountPercentage } = req.body;
            if (discountPercentage && discountPercentage > 0) {
                const discountAmount = total * (discountPercentage / 100);
                total -= discountAmount;
            }
            if (!payMethod || !restaurantFK) {
                return res.status(400).json({ message: "Payment method and restaurant ID are required" });
            }
           

            
            const newOrder = new Order({
                cartOrderFK: cartData,
                user: userObjectId,
                statusOrder: "Waiting",
                tableNb: tableNb ,
                orderNb: orderNb,
                totalPrice: total.toFixed(2),
                payMethod: payMethod,
                restaurantFK: restaurantFK,
                taxFK: taxFK, // Default to "null" if taxFK is not provided
                allergyName: allergy,
                statusCancelRequest: "No cancel request"
            });

            const newNotification = new NotificationEmployee({
                orderFK: newOrder._id,
                title: "New order",
                body: `New order received, N° ${orderNb}.`
            });
            await newNotification.save();

            const saveOrder = await newOrder.save();
            await CartTrash.find({ user: userObjectId }).deleteMany();
            return res.status(200).json({ data: saveOrder });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },
    getOrderById: async (req, res) => {
        try {
            const id = req.params.id;
            await Order.findById(id)

                .populate({
                    path: 'cartOrderFK',
                    populate: [
                        { path: 'productFK' },
                        { path: 'ingredientFK' },
                        { path: 'itemsFK' }
                    ]
                })
                .populate('restaurantFK')
                .then((data) => {
                    res.json(data);
                })
                .catch((error) => {
                    res.status(400).json({ message: error });
                });
        } catch (error) {
            res.status(500).json({ message: "Internal Server Error", error });
        }
    },


    getAllOrders: async (req, res) => {
        try {
            const tokenLogin = req.cookies.tokenLogin;
            const decodeTokenLogin = jwt_decode(tokenLogin);
            const idUser = decodeTokenLogin.id;

            const user = await User.findById(idUser);
            await Order.find({ payMethod: { $ne: "" }, restaurantFK: user.restaurantFK })
                .sort({ date: -1 })
                .populate('user')
                .populate({
                    path: 'cartOrderFK',
                    populate: [
                        { path: 'productFK' },
                    ]
                })
                .populate('user')
                .then((data) => {
                    res.json(data);
                })
                .catch((error) => {
                    res.status(400).json({ message: error });
                });
        } catch (error) {
            res.status(500).json({ message: error });
        }
    },
     getLatestOrderByUser: async (req, res) => {
        try {
            const tokenLogin = req.cookies.tokenLogin;
            const decodeTokenLogin = jwt_decode(tokenLogin);
            const idUser = decodeTokenLogin.id;
    
            const latestOrder = await Order.findOne({ user: idUser }).sort({ createdAt: -1 }).populate('restaurantFK');
            console.log("this is last order",latestOrder)
            if (!latestOrder) {
                return res.status(404).json({ message: "No orders found" });
            }
    
            res.status(200).json(latestOrder);
        } catch (err) {
            console.error('An error occurred:', err);
            res.status(500).send('An error occurred while fetching the latest order.');
        }
    },

    
    cashPaymentMethodweb: async (req, res) => {
        try {
            console.log("Processing cash payment method...");

            const { userId } = req.params;

            if (!userId) {
                return res.status(400).json({ message: "User ID is required" });
            }

            const userObjectId = new mongoose.Types.ObjectId(userId);

            // Populate user information along with the order
            const orderData = await Order.findOne({ user: userObjectId })
                .populate('cartOrderFK')
                .populate('user') // Populate user information
                .populate('restaurantFK') // Populate restaurant information
                .sort({ createdAt: -1 });

            if (!orderData) {
                return res.status(404).json({ message: 'Order not found' });
            }

            console.log("Order found:", orderData);

            orderData.payMethod = "Cash";
            const savedPayMethod = await orderData.save();

            // Attach the order data to the request object
            req.order = orderData;
            console.log("Sending email with order data:", req.order);

            // Send the email
            await invoice.sendMail(req, res);

            res.status(200).json(savedPayMethod);
        } catch (error) {
            console.error('Erreur lors du traitement de la commande:', error);
            res.status(500).json({ message: 'Erreur lors du traitement de la commande: ' + error.message });
        }
    },
   
    cardPaymentMethodweb: async (req, res) => {
        try {
            console.log("Processing card payment method...");
    
            const { userId } = req.params;
    
            if (!userId) {
                return res.status(400).json({ message: "User ID is required" });
            }
    
            const userObjectId = new mongoose.Types.ObjectId(userId);
    
            // Populate user information along with the order
            const orderData = await Order.findOne({ user: userObjectId }) // Make sure to use userObjectId here
            .sort({ date: -1 })
            .populate({
                path: 'cartOrderFK',
                populate: {
                    path: 'productFK',
                    model: 'Product',
                    select: 'name price'  // Selecting only the name and price fields from Product
                }
            })
            .populate('user')
            .populate('restaurantFK');
    
            if (!orderData) {
                return res.status(404).json({ message: "Order not found" });
            }
    
            orderData.payMethod = "Card";
            const savedPayMethod = await orderData.save();
            req.order = orderData;
    
            console.log("Order data to send in email:", req.order);
    
            await invoice.sendMail(req, res); // Ensure this function is correctly handling null/undefined cases
    
            res.status(200).json({ message: "Payment method updated and email sent", data: savedPayMethod });
        } catch (error) {
            console.error('Error processing card payment:', error);
            res.status(500).json({ message: 'Error processing card payment: ' + error.message });
        }
    },
    
    getAllOrdersByUser: async (req, res) => {
        try {
            const tokenLogin = req.cookies.tokenLogin;
            const decodeTokenLogin = jwt_decode(tokenLogin);
            const idUser = decodeTokenLogin.id;

            await Order.find({ user: idUser })
                .sort({ date: -1 })

                .populate("cartOrderFK").populate("restaurantFK")
                .then((data) => {
                    res.json(data);
                })
                .catch((error) => {
                    res.status(400).json({ message: error });
                });
        } catch (error) {
            res.status(500).json({ message: error });
        }
    },
    getAllOrdersByUserweb: async (req, res) => {
        try {
            const userId = req.params.userId;

            if (!userId) {
                return res.status(400).json({ message: "User ID is required" });
            }

            await Order.find({ user: userId })
                .sort({ date: -1 })
                .populate("cartOrderFK")
                .populate("restaurantFK")
                .then((data) => {
                    res.json(data);
                })
                .catch((error) => {
                    res.status(400).json({ message: error });
                });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    getOrderByUser: async (req, res) => {
        try {
            const tokenLogin = req.cookies.tokenLogin;
            const decodeTokenLogin = jwt_decode(tokenLogin);
            const idUser = decodeTokenLogin.id;

            const orderData = await Order.findOne({ user: idUser })
                .populate("cartOrderFK")
                .populate("restaurantFK")
                .sort({ date: -1 })
            res.send(orderData);
        } catch (error) {
            res.status(500).json({ message: error });
        }
    },
    getOrderByUserweb: async (req, res) => {
        try {
            const { userId, orderId } = req.params;

            if (!userId || !orderId) {
                return res.status(400).json({ message: "User ID and Order ID are required" });
            }

            const orderData = await Order.findOne({ user: userId, _id: orderId })
                .populate({
                    path: 'cartOrderFK',
                    populate: {
                        path: 'productFK',
                        model: 'Product'
                    }
                })
                .populate('restaurantFK');
                
    
            if (!orderData) {
                return res.status(404).json({ message: "Order not found" });
            }

            res.send(orderData);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },


    getOrderWhereReviewNotAdded: async (req, res) => {
        try {
            const tokenLogin = req.cookies.tokenLogin;
            const decodeTokenLogin = jwt_decode(tokenLogin);
            const idUser = decodeTokenLogin.id;

            const order = await Order.findOne({ user: idUser, avisAdded: false }).sort({ createdAt: -1 }).populate('user').populate('restaurantFK')

            res.status(200).json(order)
        } catch (error) {
            console.log(error);
        }

    },

    cashPaymentMethod: async (req, res) => {
        try {
            const tokenLogin = req.cookies.tokenLogin;
            const decodeTokenLogin = jwt_decode(tokenLogin);
            const idUser = decodeTokenLogin.id;
    
            // Find the latest order for the user
            const orderData = await Order.findOne({ user: idUser })
                .sort({ date: -1 })
                .populate({
                    path: 'cartOrderFK',
                    populate: {
                        path: 'productFK',
                        model: 'Product'
                    }
                })
                .populate('user')
                .populate('restaurantFK');
    
            if (!orderData) {
                return res.status(404).json({ message: 'Order not found' });
            }
    
            // Ensure restaurantFK is populated and is an ObjectId
            if (!orderData.restaurantFK || !orderData.restaurantFK._id) {
                return res.status(400).json({ message: 'Invalid restaurantFK' });
            }
    
            orderData.payMethod = "Cash";
    
            const savedPayMethod = await orderData.save();
            req.order = orderData;
            
            console.log("Sending email with order data:", req.order);
    
            await invoice.sendMail(req, res); // Send the email
    
            res.status(200).json(savedPayMethod);
        } catch (error) {
            console.error("Error in cashPaymentMethod:", error);
            res.status(500).json({ message: error.message });
        }
    },
    

    creditCardPaymentMethod: async (req, res) => {
        try {
            const tokenLogin = req.cookies.tokenLogin;
            const decodeTokenLogin = jwt_decode(tokenLogin);
            const idUser = decodeTokenLogin.id;

            const { tax } = req.body
            const orderData = await Order.findOne({ user: idUser }).populate("cartOrderFK").sort({ date: -1 })
            if (tax) {
                orderData.taxFK = tax;
            } else {
                orderData.taxFK = "null";
            }


            const savedPayMethod = await orderData.save();
            res.status(200).json(savedPayMethod);

        } catch (error) {
            res.status(500).json({ message: error })
        }
    },
    // creditCardPaymentMethodweb: async (req, res) => {
    //     const { userId } = req.params; // Récupérer le userId de l'URL
    //     const { tax } = req.body; // Récupérer le tax de la requête body
    
    //     try {
    //         const orderData = await Order.findOne({ user: userId })
    //             .populate("cartOrderFK")
    //             .sort({ date: -1 });
    
    //         if (tax) {
    //             orderData.taxFK = tax;
    //         } else {
    //             orderData.taxFK = null; // Assurez-vous de traiter le cas où il n'y a pas de tax
    //         }
    
    //         const savedPayMethod = await orderData.save();
    //         res.status(200).json(savedPayMethod);
    //     } catch (error) {
    //         res.status(500).json({ message: "Failed to update payment method: " + error });
    //     }
    // },
    creditCardPaymentMethodweb: async (req, res) => {
        const { userId } = req.params; // Retrieve the userId from the URL
    
        try {
            const orderData = await Order.findOne({ user: userId })
                .populate("cartOrderFK")
                .sort({ date: -1 });
    
            // As tax handling is removed, we do not set taxFK here anymore
    
            const savedPayMethod = await orderData.save();
            res.status(200).json(savedPayMethod);
        } catch (error) {
            res.status(500).json({ message: "Failed to update payment method: " + error });
        }
    },
    

    getOrderById: async (req, res) => {
        try {
            const id = req.params.id;
            await Order.findById(id)

                .populate({
                    path: 'cartOrderFK',
                    populate: [
                        { path: 'productFK' },
                        { path: 'ingredientFK' },
                        { path: 'itemsFK' }
                    ]
                })
                .populate('restaurantFK')
                .then((data) => {
                    res.json(data);
                })
                .catch((error) => {
                    res.status(400).json({ message: error });
                });
        } catch (error) {
            res.status(500).json({ message: "Internal Server Error", error });
        }
    },

    getStatus: async (req, res) => {
        try {
            await Order.find({ payMethod: { $ne: "" } })
                .distinct('statusOrder')
                .then((data) => {
                    res.json(data);
                })
                .catch((error) => {
                    res.status(400).json({ message: error });
                });
        } catch (error) {
            res.status(500).json({ message: error });
        }
    },

    acceptOrder: async (req, res) => {
        try {
            const { duree } = req.body

            const orderStatus = await Order.findById(req.params.id);
            orderStatus.statusOrder = "Preparing";
            orderStatus.durationPreparation = duree;
            orderStatus.dateAcceptOrder = Date.now();
            orderStatus.dateAvis = null
            console.log('accepting')
            const newNotification = new Notification({
                userConcerned: orderStatus.user,
                orderFK: req.params.id,
                title: "Order accepted",
                body: `Your order ${orderStatus.orderNb} will be ready very soon !`
            });

            const savedNotification = await newNotification.save();

            const savedStatus = await orderStatus.save();
            res.status(200).json({ savedStatus, savedNotification });

        } catch (error) {
            return res.status(500).json({ message: "Order not accepted" + "" + error });
        }
    },

    refuseOrder: async (req, res) => {
        try {
            const { reason, suggestion } = req.body
            const id = req.params.id
            const orderStatus = await Order.findById(id);
            orderStatus.statusOrder = "Refused";
            orderStatus.reason = reason;
            orderStatus.suggestion = suggestion
            orderStatus.dateAvis = null

            const newNotification = new Notification({ userConcerned: orderStatus.user, orderFK: req.params.id, title: "Order rejected", body: reason, suggestion: suggestion });
            const savedNotification = await newNotification.save();
            const savedStatus = await orderStatus.save();

            if (orderStatus.payMethod === "Credit card") {
                if (orderStatus.statusRefunded) {
                    return res.status(400).json({ message: "Order refunded" })
                }
                const totalPrice = orderStatus.totalPrice;
                const amountInCents = Math.round(totalPrice * 100);
                const refund = await stripe.refunds.create({
                    payment_intent: orderStatus.payment_intent,
                    amount: amountInCents,
                });

                if (refund.status === 'succeeded') {
                    orderStatus.statusRefunded = true;
                    orderStatus.save();
                    return res.status(200).json({ message: 'Remboursement réussi !', savedStatus, savedNotification });
                } else {
                    return res.status(400).json({ message: 'Échec du remboursement', failure_reason: refund.failure_reason });
                }
            };

        } catch (error) {
            return res.status(500).json({ message: "Order not refused " + error });
        }
    },

    updateOrderById: async (req, res) => {
        try {
            const { statusOrder, duree } = req.body;

            const orderStatus = await Order.findById(req.params.id);
            orderStatus.statusOrder = statusOrder || orderStatus.statusOrder;
            orderStatus.durationPreparation = duree || orderStatus.durationPreparation;
            orderStatus.dateAvis = null;

            if (statusOrder === "Ready" && orderStatus.payMethod === "Cash") {
                const newNotification = new Notification({
                    userConcerned: orderStatus.user,
                    orderFK: req.params.id,
                    title: "Order Ready",
                    body: `Your order ${orderStatus.orderNb} is ready! Please proceed for pickup.`
                });
                await newNotification.save();

                // Emitting an event to the frontend
                const io = req.app.get('socketio');
                io.emit('order-ready', { userId: orderStatus.user, message: newNotification.body });
            }

            if (statusOrder === "Delivered") {
                const newNotification = new Notification({
                    userConcerned: orderStatus.user,
                    orderFK: req.params.id,
                    title: "Order Delivered",
                    body: `Hey! Your order N° ${orderStatus.orderNb} has been delivered! Enjoy your delicious meal!`
                });
                await newNotification.save();
            }

            if (statusOrder === "Canceled" && orderStatus.payMethod === "Credit Card") {
                const orderAmount = orderStatus.totalPrice;
                const amountInCents = Math.round(orderAmount * 100);

                if (!orderStatus.statusRefunded) {
                    const refund = await stripe.refunds.create({
                        payment_intent: orderStatus.payment_intent,
                        amount: amountInCents,
                    });

                    if (refund.status === 'succeeded') {
                        orderStatus.statusRefunded = true;
                        const newNotification = new Notification({
                            userConcerned: orderStatus.user,
                            orderFK: req.params.id,
                            title: "Order Cancelled and Refunded",
                            body: `You have canceled your order N° ${orderStatus.orderNb}. The amount of ${orderStatus.totalPrice}$ has been refunded.`
                        });
                        await newNotification.save();
                    } else {
                        return res.status(400).json({
                            message: 'Refund failed',
                            failure_reason: refund.failure_reason
                        });
                    }
                }
            }

            if (statusOrder === "Canceled" && orderStatus.payMethod === "Cash") {
                const newNotification = new Notification({
                    userConcerned: orderStatus.user,
                    orderFK: req.params.id,
                    title: "Order Cancelled",
                    body: `You have canceled your order N° ${orderStatus.orderNb}.`
                });
                await newNotification.save();
            }

            // Save the order status after all operations
            const savedStatus = await orderStatus.save();
            res.status(200).json({ data: savedStatus });
        } catch (error) {
            res.status(500).json({ message: "Order update failed: " + error.message });
        }
    },


    getDiffTime: async (req, res) => {
        try {
            const currentDate = moment().format('HH:mm');
            const orderDurée = await Order.find({}, 'durationPreparation');
            const orderDateAccept = await Order.find({}, 'dateAcceptOrder');
            const durations = [];

            for (let i = 0; i < orderDurée.length; i++) {
                const duration = parseInt(orderDurée[i].durationPreparation);
                const dateAccept = moment(orderDateAccept[i].dateAcceptOrder, 'YYYY-MM-DD HH:mm:ss').format('HH:mm');

                const [currentHours, currentMinutes] = currentDate.split(':');
                const [acceptHours, acceptMinutes] = dateAccept.split(':');
                const currentTimeInMinutes = parseInt(currentHours) * 60 + parseInt(currentMinutes);
                const acceptTimeInMinutes = parseInt(acceptHours) * 60 + parseInt(acceptMinutes);

                const dureeInMinutes = acceptTimeInMinutes + duration;

                const dureeHours = Math.floor(dureeInMinutes / 60);
                const dureeMinutes = dureeInMinutes % 60;
                const duree = `${dureeHours.toString().padStart(2, '0')}:${dureeMinutes.toString().padStart(2, '0')}`;

                durations.push(duree);
            }
            res.json({ durations });
        } catch (error) {
            return res.status(500).json({ message: "Order not accepted" + "" + error });
        }
    },

    confirmPayOrderById: async (req, res) => {
        try {

            const orderPayment = await Order.findById(req.params.id).populate('user').populate('restaurantFK').populate({
                path: 'cartOrderFK',
                populate: [
                    { path: 'productFK' },
                    { path: 'ingredientFK' },
                    { path: 'itemsFK' }
                ]
            })
            orderPayment.statusPay = true;
            const savedPayment = await orderPayment.save();

            const invoiceSend = { order: orderPayment }
            invoice.sendMail(invoiceSend, res);

            res.status(200).json(savedPayment);
        } catch (error) {
            return res.status(500).json({ message: "Payment not confirmed " + error });
        }
    },

    invoicePayOrderCreditCardById: async (req, res) => {
        try {
            const tokenLogin = req.cookies.tokenLogin;
            const decodeTokenLogin = jwt_decode(tokenLogin);
            const idUser = decodeTokenLogin.id;

            const orderPayment = await Order.findOne({ user: idUser }).populate('user').populate('taxFK').populate('restaurantFK').populate({
                path: 'cartOrderFK',
                populate: [
                    { path: 'productFK' },
                    { path: 'ingredientFK' },
                    { path: 'itemsFK' }
                ]
            }).sort({ createdAt: -1 })

            const invoiceSend = { order: orderPayment }
            invoiceCreditCard.sendMail(invoiceSend, res);

            res.status(200).json({ message: " Invoice sent" });

        } catch (error) {
            return res.status(500).json({ message: "request not sent " + " " + error });
        }
    },
    invoicePayOrderCreditCardByIdweb: async (req, res) => {
        const { userId } = req.params; // Get userId from URL params
        try {
            const orderPayment = await Order.findOne({ user: userId })
                .populate('user')
                .populate('taxFK')
                .populate('restaurantFK')
                .populate({
                    path: 'cartOrderFK',
                    populate: [
                        { path: 'productFK' },
                        { path: 'ingredientFK' },
                        { path: 'itemsFK' }
                    ]
                })
                .sort({ createdAt: -1 });
    
            const invoiceSend = { order: orderPayment };
            invoiceCreditCard.sendMail(invoiceSend, res); // Make sure this function is properly defined to handle mailing
    
            res.status(200).json({ message: "Invoice sent" });
        } catch (error) {
            res.status(500).json({ message: "Request not sent: " + error });
        }
    },

    confirPayOrderByUser: async (req, res) => {
        try {
            const tokenLogin = req.cookies.tokenLogin;
            const decodeTokenLogin = jwt_decode(tokenLogin);
            const idUser = decodeTokenLogin.id;

            const order = await Order.findOne({ user: idUser }).sort({ createdAt: -1 })
                .populate("cartOrderFK")

            order.statusPay = true;
            order.payMethod = "Credit card"
            const savedStatusPay = await order.save();
            res.status(200).json(savedStatusPay);
        } catch (error) {
            return res.status(500).json({ message: "Order not canceled " + error });
        }
    },
// Updated function in orderController
confirPayOrderByUserweb: async (req, res) => {

    const { userId } = req.params;
    const { status, method } = req.body;
  
    try {
      // Fetch the most recent order for the user and populate the 'cartOrderFK' field
      const order = await Order.findOne({ user: userId })
                               .sort({ createdAt: -1 })
                               .populate("cartOrderFK");  // Populate the cartOrderFK to get detailed information
  
      if (!order) {
        return res.status(404).send({ error: "Order not found" });
      }
  
      order.statusPay = status;   // Update payment status
      order.payMethod = method;   // Update payment method
      await order.save();         // Save the updated order
  
      res.status(200).send(order);  // Send the updated order back as a response
    } catch (error) {
      res.status(500).send({ error: error.message });  // Handle any errors that occur
    }
},

    askCancelOrder: async (req, res) => {
        try {

            const idOrder = req.params.idOrder;
            const { reasonCancelOrder } = req.body;
            const order = await Order.findOne({ _id: idOrder });
            order.statusCancelRequest = "In progress";
            order.reasonCancelOrder = reasonCancelOrder;

            const savedAskCancelOrder = await order.save();

            return res.status(201).json({ data: savedAskCancelOrder });


        } catch (error) {
            return res.status(500).json({ message: "request not sent " + " " + error });
        }
    },

    getCancelOrderRequests: async (req, res) => {
        try {
            await Order.find({ statusCancelRequest: "In progress" })
                .sort({ date: -1 })
                .then((data) => {
                    res.json(data);
                })
                .catch((error) => {
                    res.status(400).json({ message: error });
                });
        } catch (error) {
            res.status(500).json({ message: error });
        }
    },

    ConfirmCancelOrder: async (req, res) => {
        try {
            const id = req.params.id
            const noteCancelOrder = req.body.noteCancelOrder

            const order = await Order.findById(id);
            const totalOrder = order.totalPrice

            order.statusOrder = "Canceled";
            order.statusCancelRequest = "Accepted",
                order.noteCancelOrder = noteCancelOrder
            const newNotification = new Notification({ userConcerned: order.user, orderFK: req.params.id, title: "Confirm cancel order request", body: `Your order N° ${order.orderNb} has been canceled` });
            await newNotification.save();
            const savedStatus = await order.save();
            const savesOrder = await order.save();

            if (order.payMethod === "Credit card") {
                if (order.statusRefunded) {
                    return res.status(400).json({ message: "Order refunded" })
                }

                const amountInCents = Math.round(totalOrder * 100);
                const refund = await stripe.refunds.create({
                    payment_intent: order.payment_intent,
                    amount: amountInCents,
                });

                if (refund.status === 'succeeded') {
                    order.statusRefunded = true;
                    order.save();
                    return res.status(200).json({ message: 'Remboursement réussi !', savedStatus });
                } else {
                    return res.status(400).json({ message: 'Échec du remboursement', failure_reason: refund.failure_reason });
                }
            }

            return res.status(200).json({ data: savesOrder })
        } catch (error) {
            return res.status(500).json({ message: "Order not canceled " + error });
        }
    },

    ConfirmCancelOrderCash: async (req, res) => {
        try {
            const id = req.params.id
            const noteCancelOrder = req.body.noteCancelOrder

            const orderStatus = await Order.findById(id);
            orderStatus.statusOrder = "Canceled";
            orderStatus.statusCancelRequest = "Accepted";
            orderStatus.noteCancelOrder = noteCancelOrder;
            const newNotification = new Notification({ userConcerned: orderStatus.user, orderFK: req.params.id, title: "Confirm cancel order cash request", body: `Your order N° ${orderStatus.orderNb} has been canceled` });
            await newNotification.save();


            const savedStatus = await orderStatus.save();
            res.status(200).json(savedStatus);
        } catch (error) {
            return res.status(500).json({ message: "Order not accepted" + "" + error });
        }
    },

    RejectCancelOrder: async (req, res) => {
        try {
            const noteCancelOrder = req.body.noteCancelOrder;
            const order = await Order.findById(req.params.id);
            order.statusCancelRequest = "Rejected"
            order.noteCancelOrder = noteCancelOrder;
            const newNotification = new Notification({ userConcerned: order.user, orderFK: req.params.id, title: "Reject cancel order request", body: `Your order N° ${order.orderNb} has been canceled` });
            await newNotification.save();
            const savesOrder = await order.save();

            res.status(200).json(savesOrder);
        } catch (error) {
            return res.status(500).json({ message: "Order not canceled " + error });
        }
    },

    UpdateOrder: async (req, res) => {
        let total = 0;
        let convertPromotion = 0;
        let convertedPrice = 0;
        try {
            const tokenLogin = req.cookies.tokenLogin;
            const decodeTokenLogin = jwt_decode(tokenLogin);
            const idUser = decodeTokenLogin.id;

            const idOrder = req.params.idOrder;
            const productId = req.params.productId;

            const updatedProducts = req.body.updatedProducts;
            const ingredientId = req.body.ingredientId;
            const itemId = req.body.itemId;

            const order = await Order.findOne({ _id: idOrder }).populate({
                path: 'cartOrderFK',
                populate: { path: 'productFK', path: 'ingredientFK', path: 'itemsFK' }
            });

            const oldPrice = order.totalPrice;

            const cartOrder = await CartOrder.findOne({ _id: order.cartOrderFK }).populate('productFK').populate('ingredientFK').populate('itemsFK')
            const product = await Product.findOne({ _id: updatedProducts })
            const ingredient = await Ingredient.findOne({ _id: ingredientId });
            const item = await Item.findOne({ _id: itemId });

            const productIndex = cartOrder.productFK.findIndex(product => product._id.equals(productId));

            cartOrder.productFK[productIndex] = product._id || cartOrder.productFK[productIndex];
            cartOrder.ingredientFK[productIndex] = ingredient._id || null;
            cartOrder.itemsFK[productIndex] = item._id || null;

            await cartOrder.save();

            const cartData = await CartOrder
                .findOne({ user: idUser }).sort({ updatedAt: -1 })
                .populate("productFK")
                .populate("ingredientFK")
                .populate('itemsFK');

            const restaurantId = cartData.restaurantFK;
            const restaurant = await Restaurant.findOne({ "_id": restaurantId });
            convertTPS = restaurant.taxeTPS / 100;
            convertTVQ = restaurant.taxeTVQ / 100;

            if (cartData) {
                for (let i = 0; i < cartData.productFK.length; i++) {
                    if (cartData.productFK[i].promotion === 0 || cartData.ingredientFK[i]?.type === 'Required') {

                        total = cartData.productFK[i].price * cartData.quantityProduct[i];
                        convertedPriceTPS = total * convertTPS;
                        convertPriceTVQ = total * convertTVQ;
                        total = (total + convertedPriceTPS + convertPriceTVQ)

                    } else {
                        convertPromotion = cartData.productFK[i].promotion / 100;
                        convertedPrice = cartData.productFK[i].price * convertPromotion;
                        productPrice = cartData.productFK[i].price - convertedPrice;
                        productItemprice = productPrice + cartData.itemsFK[i]?.price

                        if (cartData.itemsFK[i]) {
                            total = total + productPrice * cartData.quantityProduct[i] + cartData.itemsFK[i].price
                            convertedPriceTPS = total * convertTPS;
                            convertPriceTVQ = total * convertTVQ;
                            total = (total + convertedPriceTPS + convertPriceTVQ)
                        } else {
                            total = total + productPrice * cartData.quantityProduct[i]
                            convertedPriceTPS = total * convertTPS;
                            convertPriceTVQ = total * convertTVQ;
                            total = (total + convertedPriceTPS + convertPriceTVQ)
                        }
                    }
                    order.totalPrice = total;
                    order.save();

                    if (oldPrice > total) {
                        const diff = (oldPrice - total).toFixed(2)
                        const amountInCents = Math.round(diff * 100);

                        if (order.statusRefunded) {
                            console.log("order refunded")
                        }
                        const refund = await stripe.refunds.create({
                            payment_intent: order.payment_intent,
                            amount: amountInCents,
                        });

                        if (refund.status === 'succeeded') {
                            order.statusRefunded = true;
                            order.statusModified = true;
                            order.save();
                            return res.status(200).json({ message: 'Remboursement réussi !' });
                        } else {
                            return res.status(400).json({ message: 'Échec du remboursement', failure_reason: refund.failure_reason });
                        }
                    } else if (oldPrice < total) {
                        const diff = (total - oldPrice).toFixed(2);
                        const emailUser = order.user.email;

                        try {
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
                            const amountInCents = Math.round(diff * 100);
                            const paymentIntent = await stripe.paymentIntents.create({
                                amount: amountInCents,
                                currency: 'usd',
                                customer: customer.id,
                                payment_method_types: ['card'],
                            });

                            res.json({
                                paymentIntent: paymentIntent.client_secret,
                                ephemeralKey: ephemeralKey.secret,
                                customer: customer.id,
                                publishableKey: process.env.PUBLISH_STRIPE_KEY,
                            });

                            order.statusRefunded = false;
                            order.statusModified = true;
                            order.payment_intent = paymentIntent.id;
                        } catch (error) {
                            console.error('Error processing payment:', error);
                            let message = 'An error occurred while processing your payment.';

                            if (error.type === 'StripeCardError') {
                                message = error.message;
                            }

                            res.status(500).json({ error: 'Payment failed' });
                        }
                    } else if (oldPrice == total) {
                        order.statusModified = true
                    }
                }
            }
            order.save();

        } catch (error) {
            return res.status(500).json({ message: "Erreur lors de la mise à jour de la commande : " + error });
        }
    },

    UpdatedOrderMethodPaymentCash: async (req, res) => {
        try {
            const idOrder = req.params.idOrder;
            const productId = req.params.productId;

            const updatedProducts = req.body.updatedProducts;
            const ingredientId = req.body.ingredientId;
            const itemId = req.body.itemId;

            const order = await Order.findOne({ _id: idOrder }).populate({
                path: 'cartOrderFK',
                populate: { path: 'productFK', path: 'ingredientFK', path: 'itemsFK' }
            });
            const cartOrder = await CartOrder.findOne({ _id: order.cartOrderFK }).populate('productFK').populate('ingredientFK').populate('itemsFK')
            const product = await Product.findOne({ _id: updatedProducts })
            const ingredient = await Ingredient.findOne({ _id: ingredientId });
            const item = await Item.findOne({ _id: itemId });

            const productIndex = cartOrder.productFK.findIndex(product => product._id.equals(productId));

            cartOrder.productFK[productIndex] = product._id || cartOrder.productFK[productIndex];
            cartOrder.ingredientFK[productIndex] = ingredient._id || "null";
            cartOrder.itemsFK[productIndex] = item._id || "null";

            const savedUpdates = await cartOrder.save();
            order.statusModified = 1
            order.save();
            return res.status(200).json({ savedUpdates })


        } catch (error) {
            return res.status(500).json({ message: "Erreur lors de la mise à jour de la commande : " + error });
        }
    },

    getOrdersPagination: async (req, res, next) => {
        try {
            const tokenLogin = req.get('Authorization').split(' ')[1];
            let decodeTokenLogin = jwt_decode(tokenLogin);
            let idUser = decodeTokenLogin.id;
            let user =await User.findById(idUser)
            if (user.role=="employee"){
              idUser=user.owner;
            }
            const restaurant = await findRestaurantByOwnerId(idUser);
            const restaurantId = restaurant._id;

            const page = parseInt(req.query.page) || 1;
            const limit = 30;
            const skip = (page - 1) * limit;
            const searchQuery = req.query.search || '';

            let query = {};
            query.statusOrder = { $in: ['Waiting', 'Preparing', 'Ready', 'Completed'] };

            if (searchQuery) {
                const searchNumber = parseInt(searchQuery);
                if (!isNaN(searchNumber)) {
                    query.orderNb = searchNumber;
                } else {
                    res.status(400).json({ message: "Invalid search query. Please provide a number." });
                    return;
                }
            }

            // Fetch orders from MongoDB
            const orders = await Order.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate({
                    path: 'cartOrderFK',
                    populate: [
                        { path: 'productFK', model: 'Product' },
                        { path: 'ingredientFK', model: 'Ingredient' }
                    ]
                });

            // Custom sort order for statusOrder
            const statusOrderPriority = { 'Waiting': 1, 'Preparing': 2, 'Ready': 4, 'Completed': 3 };
            orders.sort((a, b) => {
                if (statusOrderPriority[a.statusOrder] < statusOrderPriority[b.statusOrder]) return -1;
                if (statusOrderPriority[a.statusOrder] > statusOrderPriority[b.statusOrder]) return 1;
                return 0;
            });

            const total = await Order.countDocuments(query);

            res.json({ orders, total });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server Error" });
        }
    },

    getOrdersPaginationHistory: async (req, res, next) => {
        try {

            const tokenLogin = req.get('Authorization').split(' ')[1];
            let decodeTokenLogin = jwt_decode(tokenLogin);
            let idUser = decodeTokenLogin.id;
            // let idUser = '64ec84b22b8071e06b57e415';
            let user =await User.findById(idUser)
            if (user.role=="employee"){
              idUser=user.owner;
            }
            const restaurant = await findRestaurantByOwnerId(idUser);
            const restaurantId = restaurant._id;

            const page = parseInt(req.query.page) || 1;
            const limit = 30;
            const skip = (page - 1) * limit;
            const searchQuery = req.query.search || '';

            let query = {};
            const now = new Date();
            // Set time to 00:00:00
            now.setHours(0, 0, 0, 0);

            // Update query to include createdAt > current date at 00:00
            query.createdAt = { $lt: now };
            query.statusOrder = { $in: ['Ready', 'Waiting', 'Canceled', 'Completed', 'Archived'] };

            if (searchQuery) {
                const searchNumber = parseInt(searchQuery);
                if (!isNaN(searchNumber)) {
                    query.orderNb = searchNumber;
                } else {
                    res.status(400).json({ message: "Invalid search query. Please provide a number." });
                    return;
                }
            }

            const orders = await Order.find(query)
                .sort({ createdAt: 1 })
                .skip(skip)
                .limit(limit)
                .populate({
                    path: 'cartOrderFK',
                    populate: [
                        { path: 'productFK', model: 'Product' },
                        { path: 'ingredientFK', model: 'Ingredient' }
                    ]
                });
            const total = await Order.countDocuments(query);

            res.json({ orders, total });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server Error" });
        }
    },
    acceptOrderOne: async (req, res) => {
        try {
            const { durationPreparation } = req.body

            const orderStatus = await Order.findById(req.params.id);
            orderStatus.statusOrder = "Preparing";
            orderStatus.durationPreparation = parseInt(durationPreparation);
            //  if (!orderStatus.dateAcceptOrder){
            orderStatus.dateAcceptOrder = new Date();
            //   }
            //  orderStatus.dateAvis = null

            const newNotification = new Notification({
                userConcerned: orderStatus.user,
                orderFK: req.params.id,
                title: "Order accepted",
                body: `Your order ${orderStatus.orderNb} will be ready verry soon !`
            });

            const savedNotification = await newNotification.save();

            const savedStatus = await orderStatus.save();
            // client annuler cette function
           // scheduleComplitedOrder(orderStatus, parseInt(durationPreparation));


            res.status(200).json({ savedStatus/* , savedNotification*/ });

        } catch (error) {
            return res.status(500).json({ message: "Order not accepted" + "" + error });
        }
    },
    completedOrder: async (req, res) => {
        try {
            //   const { durationPreparation } = req.body

            const orderStatus = await Order.findById(req.params.id);
            orderStatus.statusOrder = "Ready";
            // orderStatus.durationPreparation = durationPreparation;
            //  orderStatus.dateAcceptOrder =  new Date();
            //  orderStatus.dateAvis = null

            const newNotification = new Notification({
                userConcerned: orderStatus.user,
                orderFK: req.params.id,
                title: "Ready",
                body: `Your order ${orderStatus.orderNb} will be ready verry soon !`
            });

            const savedNotification = await newNotification.save();

            const savedStatus = await orderStatus.save();
            res.status(200).json({ savedStatus/* , savedNotification*/ });

        } catch (error) {
            return res.status(500).json({ message: "Order not accepted" + "" + error });
        }
    },
    cancelationOrder: async (req, res) => {
        try {
            const { reasonCancelOrder, noteCancelOrder, productsSuggestion } = req.body

            const orderStatus = await Order.findById(req.params.id);
            orderStatus.reasonCancelOrder = reasonCancelOrder;
            orderStatus.noteCancelOrder = noteCancelOrder;
            orderStatus.statusOrder = "Canceled";
            // console.log('productsSuggestion' + JSON.stringify(productsSuggestion))
            //  orderStatus.dateAcceptOrder =  new Date();
            //  orderStatus.dateAvis = null




            try {
                // Step 1: Find the Cart document based on cartOrderFK
                let cart = await CartOrder.findById(orderStatus.cartOrderFK[0]);
                //  console.log('id cart '+orderStatus.cartOrderFK[0])

                // console.log('cart '+ JSON.stringify(cart))



                // Step 3: Update the productsSuggestion field
                cart.productsSuggestion = productsSuggestion;

                // Save the updated/created Cart document
                await cart.save();

                console.log('Cart productsSuggestion updated/created successfully');
            } catch (error) {
                console.error('Error updating/creating productsSuggestion:', error.message);
                // Handle error
            }








            const newNotification = new Notification({
                userConcerned: orderStatus.user,
                orderFK: req.params.id,
                title: "Canceled",
                body: `Your order ${orderStatus.orderNb} will be ready verry soon !`
            });

            const savedNotification = await newNotification.save();

            const savedStatus = await orderStatus.save();
            res.status(200).json({ savedStatus/* , savedNotification*/ });

        } catch (error) {
            return res.status(500).json({ message: "Order not accepted" + "" + error });
        }
    },
    getOrdersPreparingPagination: async (req, res, next) => {
        try {

            const tokenLogin = req.get('Authorization').split(' ')[1];
            let decodeTokenLogin = jwt_decode(tokenLogin);
            let idUser = decodeTokenLogin.id;
            // let idUser = '64ec84b22b8071e06b57e415';
            let user =await User.findById(idUser)
            if (user.role=="employee"){
              idUser=user.owner;
            }
            const restaurant = await findRestaurantByOwnerId(idUser);
            const restaurantId = restaurant._id;

            const page = parseInt(req.query.page) || 1;
            const limit = 30;
            const skip = (page - 1) * limit;
            const searchQuery = req.query.search || '';

            let query = {};
            // Get current date
            const now = new Date();
            // Set time to 00:00:00
            now.setHours(0, 0, 0, 0);

            // Update query to include createdAt > current date at 00:00
            //query.createdAt = { $gt: now };
            query.statusOrder = { $in: ['Preparing'] };

            if (searchQuery) {
                const searchNumber = parseInt(searchQuery);
                if (!isNaN(searchNumber)) {
                    query.orderNb = searchNumber;
                } else {
                    res.status(400).json({ message: "Invalid search query. Please provide a number." });
                    return;
                }
            }

            const orders = await Order.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate({
                    path: 'cartOrderFK',
                    populate: [
                        { path: 'productFK', model: 'Product' },
                        { path: 'ingredientFK', model: 'Ingredient' }
                    ]
                });
            const total = await Order.countDocuments(query);

            res.json({ orders, total });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server Error" });
        }
    },
    getOrdersCompletedPagination: async (req, res, next) => {
        try {

            const tokenLogin = req.get('Authorization').split(' ')[1];
            let decodeTokenLogin = jwt_decode(tokenLogin);
            let idUser = decodeTokenLogin.id;
            // let idUser = '64ec84b22b8071e06b57e415';
            let user =await User.findById(idUser)
            if (user.role=="employee"){
              idUser=user.owner;
            }
            const restaurant = await findRestaurantByOwnerId(idUser);
            const restaurantId = restaurant._id;

            const page = parseInt(req.query.page) || 1;
            const limit = 30;
            const skip = (page - 1) * limit;
            const searchQuery = req.query.search || '';

            let query = {};
            // Get current date
            const now = new Date();
            // Set time to 00:00:00
            now.setHours(0, 0, 0, 0);

            // Update query to include createdAt > current date at 00:00
            //query.createdAt = { $gt: now };
            query.statusOrder = { $in: ['Ready', 'Completed'] };

            if (searchQuery) {
                const searchNumber = parseInt(searchQuery);
                if (!isNaN(searchNumber)) {
                    query.orderNb = searchNumber;
                } else {
                    res.status(400).json({ message: "Invalid search query. Please provide a number." });
                    return;
                }
            }

            const orders = await Order.find(query)
                .sort({ statusOrder: 1, createdAt: -1 }) // Sorting by statusOrder and then by createdAt
                .skip(skip)
                .limit(limit)
                .populate({
                    path: 'cartOrderFK',
                    populate: [
                        { path: 'productFK', model: 'Product' },
                        { path: 'ingredientFK', model: 'Ingredient' }
                    ]
                });
            const total = await Order.countDocuments(query);

            res.json({ orders, total });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server Error" });
        }
    },
    getOrdersSearchPagination: async (req, res, next) => {
        try {

            const tokenLogin = req.get('Authorization').split(' ')[1];
            let decodeTokenLogin = jwt_decode(tokenLogin);
            let idUser = decodeTokenLogin.id;
            // let idUser = '64ec84b22b8071e06b57e415';
            let user =await User.findById(idUser)
            if (user.role=="employee"){
              idUser=user.owner;
            }
            const restaurant = await findRestaurantByOwnerId(idUser);
            const restaurantId = restaurant._id;

            const page = parseInt(req.query.page) || 1;
            const limit = 30;
            const skip = (page - 1) * limit;
            const searchQuery = req.query.search || '';

            let query = {};
            // Get current date
            const now = new Date();
            // Set time to 00:00:00
            now.setHours(0, 0, 0, 0);

            // Update query to include createdAt > current date at 00:00
            //query.createdAt = { $gt: now };
            query.statusOrder = { $in: ['Ready', 'Preparing', 'Waiting'] };

            if (searchQuery) {
                const searchNumber = parseInt(searchQuery);
                if (!isNaN(searchNumber)) {
                    query.orderNb = searchNumber;
                } else {
                    res.status(400).json({ message: "Invalid search query. Please provide a number." });
                    return;
                }
            }

            const orders = await Order.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate({
                    path: 'cartOrderFK',
                    populate: [
                        { path: 'productFK', model: 'Product' },
                        { path: 'ingredientFK', model: 'Ingredient' }
                    ]
                });
            const total = await Order.countDocuments(query);

            res.json({ orders, total });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server Error" });
        }
    },
    readyToCompletedOrder: async (req, res) => {
        try {
            //   const { durationPreparation } = req.body

            const orderStatus = await Order.findById(req.params.id);
            const status = req.params.status
            orderStatus.statusOrder = status;
            // orderStatus.durationPreparation = durationPreparation;
            //  orderStatus.dateAcceptOrder =  new Date();
            //  orderStatus.dateAvis = null

            const newNotification = new Notification({
                userConcerned: orderStatus.user,
                orderFK: req.params.id,
                title: "Ready",
                body: `Your order ${orderStatus.orderNb} will be ready verry soon !`
            });

            const savedNotification = await newNotification.save();

            const savedStatus = await orderStatus.save();
            res.status(200).json({ savedStatus/* , savedNotification*/ });

        } catch (error) {
            return res.status(500).json({ message: "Order Completed" + "" + error });
        }
    },
    getOrdersWaitingPagination: async (req, res, next) => {
        try {

            const tokenLogin = req.get('Authorization').split(' ')[1];
            let decodeTokenLogin = jwt_decode(tokenLogin);
            let idUser = decodeTokenLogin.id;
            // let idUser = '64ec84b22b8071e06b57e415';
            let user =await User.findById(idUser)
            if (user.role=="employee"){
              idUser=user.owner;
            }
            const restaurant = await findRestaurantByOwnerId(idUser);
            const restaurantId = restaurant._id;

            const page = parseInt(req.query.page) || 1;
            const limit = 30;
            const skip = (page - 1) * limit;
            const searchQuery = req.query.search || '';

            let query = {};
            // Get current date
            const now = new Date();
            // Set time to 00:00:00
            now.setHours(0, 0, 0, 0);

            // Update query to include createdAt > current date at 00:00
            //query.createdAt = { $gt: now };
            query.statusOrder = { $in: ['Waiting'] };

            if (searchQuery) {
                const searchNumber = parseInt(searchQuery);
                if (!isNaN(searchNumber)) {
                    query.orderNb = searchNumber;
                } else {
                    res.status(400).json({ message: "Invalid search query. Please provide a number." });
                    return;
                }
            }

            const orders = await Order.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate({
                    path: 'cartOrderFK',
                    populate: [
                        { path: 'productFK', model: 'Product' },
                        { path: 'ingredientFK', model: 'Ingredient' }
                    ]
                });
            const total = await Order.countDocuments(query);

            res.json({ orders, total });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server Error" });
        }
    },
    getAllOrdersWeb: async (req, res) => {
        try {
            const tokenLogin = req.get('Authorization').split(' ')[1];
            let decodeTokenLogin = jwt_decode(tokenLogin);
            let idUser = decodeTokenLogin.id;
            let user =await User.findById(idUser)
            if (user.role=="employee"){
              idUser=user.owner;
            }
            const restaurant = await findRestaurantByOwnerId(idUser);
            const restaurantId = restaurant._id;

           
            let query = {};
            // Get current date
            const now = new Date();
            // Set time to 00:00:00
            now.setHours(0, 0, 0, 0);

            // Update query to include createdAt > current date at 00:00
          //  query.createdAt = { $gt: now };
            query.statusOrder = { $in: ['Waiting'] };
           
           
            // Fetch orders from MongoDB
            const orders = await Order.find(query)
                .sort({ createdAt: -1 })               
                .populate(
                    'user'
                );

            // Custom sort order for statusOrder
           


            res.json({ orders });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server Error" });
        }
    },
 

}

module.exports = orderController;