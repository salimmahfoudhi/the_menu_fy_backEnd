const express = require('express');
const router = express.Router();
const _ = require ("../controllers/cart.controller")
const Cart = require('../models/cart.model');

router.post('/addtocartweb/:userPass',_.addtocartweb);
router.post('/addProductToCart',_.addtocart);
router.post('/addtocart/:userPass', _.addToCarts);
router.put('/increase/quantity/Cartweb/Trash/:userId/:productFK', _.increasequantityProductInCartTrashweb);
router.put('/decrease/quantity/Cartweb/Trash/:userId/:productFK', _.decreaseQuantityProductInCartTrashweb);
router.put('/increase/quantity/Cartweb/Order/:productFK/:userId', _.increaseQuantityProductInCartOrderweb);

// Diminuer la quantité d'un produit dans le panier (Order)
router.put('/decrease/quantity/Cartweb/Order/:productFK/:userId', _.decreaseQuantityProductInCartOrderweb);
router.delete ('/remove/:id' , _.removefromcartweb);
router.delete ('/clear' , _.clearcartweb);
router.delete('/clear/:userId', _.clearcartwebs);
router.get('/get/cartTrashweb/by/user/:userId', _.getCartTrashByUserweb);
router.get('/get/cartOrderweb/by/user/:userId', _.getCartOrderByUserweb);
router.delete('/delete/productweb/:productId/:userId', _.deleteProductByIdweb);

// POST route to add a product to the cart
router.post('/cart/add', async (req, res) => {
    try {
        const { userId, productId, quantity, ingredientFK, itemsFK, tableNb } = req.body;
        let cart = await Cart.findOne({ user: userId });

        if (cart) {
            // Check if the product already exists in the cart
            let productIndex = cart.productFK.findIndex(pid => pid.toString() === productId);

            if (productIndex > -1) {
                // Product exists in the cart, update the quantity
                cart.quantityProduct[productIndex] += quantity;
            } else {
                // Product does not exist in the cart, add new item
                cart.productFK.push(productId);
                cart.quantityProduct.push(quantity);
                cart.ingredientFK.push(...ingredientFK); // Assuming multiple ingredientFK can be passed
                cart.itemsFK.push(...itemsFK); // Assuming multiple itemsFK can be passed
            }
        } else {
            // No cart for the user, create a new cart
            cart = new Cart({
                user: userId,
                productFK: [productId],
                quantityProduct: [quantity],
                ingredientFK: [...ingredientFK],
                itemsFK: [...itemsFK],
                tableNb: tableNb
            });
        }
        await cart.save();
        res.status(201).json(cart);
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ message: 'Error adding to cart', error: error.message });
    }
});
// router.post ('/addProdductToCart', _.addtocart);

router.put ('/increase/quantity/Cart/Trash/:idCartTrash/:productFK' , _.increasequantityProductInCartTrash);
router.put ('/increase/quantity/Cart/Order/:productFK' , _.increasequantityProductInCartOrder);
// router.put ('/decrease/quantity/Cart/Trash/:idCartTrash/:productFK' , _.decreasequantityProductInCartTrash);
router.put ('/decrease/quantity/Cart/Order/:productFK' , _.decreasequantityProductInCartOrder);

router.delete ('/remove/:id' , _.removefromcart);
router.delete ('/clear' , _.clearcart);
router.get('/get/cartTrash/by/user', _.getCartTrashByUser)
router.get('/get/cartOrder/by/user', _.getCartOrderByUser)
router.delete('/delete/product/:productId', _.deleteProductById);
module.exports = router;