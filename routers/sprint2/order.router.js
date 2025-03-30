const express = require('express');
const router = express.Router();
const orderController = require ("../../controllers/sprint2/order.controller")
const Order = require('../../models/sprint2/order.model');
const pdf = require('html-pdf');
const fs = require('fs');
const path = require('path');
const generateOrderPdfTemplate = require('../../controllers/documents/index');

router.post('/add/order', orderController.addOrder);
router.post('/addOrderweb/:userId', orderController.addOrderweb);
router.put('/cash/method/paymentweb/:userId', orderController.cashPaymentMethodweb);
router.put('/credit/card/method/paymentweb/:userId', orderController.cardPaymentMethodweb);


router.get('/getAllOrder', orderController.getAllOrders);
router.get('/get/all/By/user', orderController.getAllOrdersByUser);
router.get('/getById/:id', orderController.getOrderById);
router.get('/order/get/all/By/user/:userId', orderController.getAllOrdersByUserweb);
router.get('/get/order/By/user', orderController.getOrderByUser);
router.get('/get/order/By/user/:userId', orderController.getOrderByUserweb);
router.get('/get/order/review/not/added', orderController.getOrderWhereReviewNotAdded);
router.get('/getOrderByUserId/:userId/:orderId', orderController.getOrderByUserweb);
router.get('/getStatus', orderController.getStatus);
router.put('/acceptOrder/:id', orderController.acceptOrder);
router.put('/refuseOrder/:id', orderController.refuseOrder);
router.put('/updateOrder/:id', orderController.updateOrderById);
router.put('/cash/method/payment', orderController.cashPaymentMethod);
router.put('/credit/card/method/payment', orderController.creditCardPaymentMethod);
router.put('/credit/card/method/payment/:userId', orderController.creditCardPaymentMethodweb);
router.put('/confirmPaymentOrderById/:id', orderController.confirmPayOrderById);
router.put('/update/status/pay/by/user', orderController.confirPayOrderByUser);
router.put('/update/status/pay/by/user/:userId', orderController.confirPayOrderByUserweb);
router.post('/send/invoice/credit/card/pay', orderController.invoicePayOrderCreditCardById);
router.post('/send/invoice/credit/card/pay/:userId', orderController.invoicePayOrderCreditCardByIdweb);
router.get('/get/latestOrderByUser', orderController.getLatestOrderByUser);
router.get('/getDiffTime', orderController.getDiffTime);
router.put('/ask/cancel/order/:idOrder', orderController.askCancelOrder);
router.get('/getCancelRequests', orderController.getCancelOrderRequests);

router.put('/confirmCancelOrder/:id', orderController.ConfirmCancelOrder);
router.put('/ConfirmCancelOrderCash/:id', orderController.ConfirmCancelOrderCash);
router.put('/rejectCancelOrder/:id', orderController.RejectCancelOrder);

router.put('/update/order/:idOrder/:productId', orderController.UpdateOrder);
router.put('/update/order/When/payMethod/cash/:idOrder/:productId', orderController.UpdatedOrderMethodPaymentCash);


router.get('/getOrdersPagination', orderController.getOrdersPagination);
router.get('/getOrdersPreparingPagination', orderController.getOrdersPreparingPagination);
router.get('/getOrdersCompletedPagination', orderController.getOrdersCompletedPagination);
router.get('/getOrdersSearchPagination', orderController.getOrdersSearchPagination);

router.put('/acceptOrderOne/:id', orderController.acceptOrderOne);
router.put('/completedOrder/:id', orderController.completedOrder);
router.get('/getOrdersPaginationHistory', orderController.getOrdersPaginationHistory);
router.put('/cancelationOrder/:id', orderController.cancelationOrder);
router.put('/readyToCompletedOrder/:id/:status', orderController.readyToCompletedOrder);
router.get('/getOrdersWaitingPagination', orderController.getOrdersWaitingPagination);
router.get('/getAllOrdersWeb', orderController.getAllOrdersWeb);



router.get('/getpdfOrderByUserId/:userId/:orderId', async (req, res) => {
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
            .populate('user')  // Ensures user details are fetched
            .populate('restaurantFK');  // Ensures restaurant details are fetched

        if (!orderData) {
            return res.status(404).json({ message: "Order not found." });
        }

        // Logging the order data to console for debugging
        console.log(JSON.stringify(orderData, null, 2));

        const htmlContent = generateOrderPdfTemplate(orderData);
        const options = { format: 'A4' };

        // Generate the PDF
        pdf.create(htmlContent, options).toBuffer((err, buffer) => {
            if (err) {
                return res.status(500).json({ message: "Error creating PDF" });
            }

            // Send PDF directly to client:
            res.writeHead(200, {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="order_${orderData._id}.pdf"`,
                'Content-Length': buffer.length
            });
            res.end(buffer);
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;
