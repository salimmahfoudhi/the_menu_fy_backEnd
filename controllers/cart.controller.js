const Cart = require("../models/cart.model");
const CartOrder = require("../models/sprint2/cartOrder.model");
const CartTrash = require("../models/sprint2/cartTrash.model");
const Product = require("../models/product.model");
const jwt_decode = require("jwt-decode");
const Restaurant = require('../models/restaurant.model')
const mongoose = require('mongoose');
const CartController = {

  addtocart: async (req, res) => {
    try {
      const tokenLogin = req.cookies.tokenLogin;
      const decodeTokenLogin = jwt_decode(tokenLogin);
      const idUser = decodeTokenLogin.id;
      const { productFK, ingredientFK = [], itemsFK = [], tableNb, restaurantFK,} = req.body;
      const user = req.params.id || idUser;
      const cart = await CartTrash.findOne({ user: idUser}).sort({ createdAt: -1 })

      const latestUserCartTrash = await CartTrash.findOne({ user: idUser }).sort({
        createdAt: -1
      })
      const latestUserCartOrder = await CartOrder.findOne({ user: idUser }).sort({
        createdAt: -1
      })

      if (latestUserCartTrash && latestUserCartOrder) {
        const productIndex = cart.productFK.findIndex(p => p.toString() === productFK);

        if (productIndex !== -1) {
            // Product exists, increase quantity
            latestUserCartTrash.quantityProduct[productIndex]++;
            latestUserCartOrder.quantityProduct[productIndex]++;
        } else {

        latestUserCartTrash.productFK.push(productFK);
        latestUserCartTrash.ingredientFK.push(...ingredientFK);
        latestUserCartTrash.itemsFK.push(...itemsFK);
        latestUserCartTrash.quantityProduct.push(1);

        latestUserCartOrder.productFK.push(productFK);
        latestUserCartOrder.ingredientFK.push(...ingredientFK);
        latestUserCartOrder.itemsFK.push(...itemsFK);
        latestUserCartOrder.quantityProduct.push(1);}

        await latestUserCartTrash.save();
        await latestUserCartOrder.save();

        res.json({ latestUserCartTrash, latestUserCartOrder });
      } else {
        
          const cartItemOrder = new CartOrder({
            productFK: productFK,
            ingredientFK: ingredientFK,
            itemsFK: itemsFK,
            tableNb: tableNb,
            quantityProduct: [1],
            user: user,
            restaurantFK: restaurantFK,
          });
          const cartItemTrash = new CartTrash({
            productFK: productFK,
            ingredientFK: ingredientFK,
            itemsFK: itemsFK,
            tableNb: tableNb,
            quantityProduct: [1],
            user: user,
            restaurantFK: restaurantFK,
          });
          await cartItemOrder.save();
          await cartItemTrash.save();

          res.json({ cartItemOrder, cartItemTrash });
        
      }

    } catch (error) {
      console.error("Failed in addtocart:", { endpoint: req.path, error: error });
      res.status(500).json({ message: "Internal Server Error", error: error.toString() });
    }
  },

   addtocartweb : async (req, res) => {
    let guestObjectId = new mongoose.Types.ObjectId("000000000000000000000000");
    let user = guestObjectId;  // ID par défaut pour les invités
  
    const userPass = req.params.userPass || guestObjectId.toString();
  
    if (userPass !== guestObjectId.toString()) {
      try {
        user = new mongoose.Types.ObjectId(userPass);
      } catch (error) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
    }
  
    const { productFK, ingredientFK = [], itemsFK = [], restaurantFK } = req.body;
  
    try {
      if (!productFK || !restaurantFK) {
        return res.status(400).json({ message: "Missing required fields" });
      }
  
      const latestUserCartTrash = await CartTrash.findOne({ user, restaurantFK }).sort({ createdAt: -1 });
      const latestUserCartOrder = await CartOrder.findOne({ user, restaurantFK }).sort({ createdAt: -1 });
  
      const incrementQuantity = (cart, productFK) => {
        const productIndex = cart.productFK.findIndex(item => item.toString() === productFK);
        if (productIndex !== -1) {
          cart.quantityProduct[productIndex] += 1;
          return true;
        }
        return false;
      };
  
      if (latestUserCartTrash && latestUserCartOrder) {
        const productExistsInTrash = incrementQuantity(latestUserCartTrash, productFK);
        const productExistsInOrder = incrementQuantity(latestUserCartOrder, productFK);
  
        if (!productExistsInTrash) {
          latestUserCartTrash.productFK.push(productFK);
          latestUserCartTrash.ingredientFK.push(...ingredientFK);
          latestUserCartTrash.itemsFK.push(...itemsFK);
          latestUserCartTrash.quantityProduct.push(1);
        }
  
        if (!productExistsInOrder) {
          latestUserCartOrder.productFK.push(productFK);
          latestUserCartOrder.ingredientFK.push(...ingredientFK);
          latestUserCartOrder.itemsFK.push(...itemsFK);
          latestUserCartOrder.quantityProduct.push(1);
        }
  
        await latestUserCartTrash.save();
        await latestUserCartOrder.save();
  
        res.json({ message: "Product added to both trash and order successfully!", latestUserCartTrash, latestUserCartOrder });
      } else {
        const newCartItemOrder = new CartOrder({
          productFK,
          ingredientFK,
          itemsFK,
          quantityProduct: [1],
          user,
          restaurantFK,
        });
        const newCartTrash = new CartTrash({
          productFK,
          ingredientFK,
          itemsFK,
          quantityProduct: [1],
          user,
          restaurantFK,
        });
        await newCartItemOrder.save();
        await newCartTrash.save();
  
        res.json({ message: "New cart and order created successfully!", newCartItemOrder, newCartTrash, cartId: newCartTrash._id });
      }
    } catch (error) {
      console.error("Failed to add to cart:", error);
      res.status(500).json({ message: "Internal Server Error", error });
    }
  },
 addToCarts : async (req, res) => {
  let guestObjectId = new mongoose.Types.ObjectId("000000000000000000000000");
  let user = guestObjectId;  // Default ID for guests

  const userPass = req.params.userPass || guestObjectId.toString();

  if (userPass !== guestObjectId.toString()) {
      try {
          user = new mongoose.Types.ObjectId(userPass);
      } catch (error) {
          return res.status(400).json({ message: "Invalid user ID" });
      }
  }

  const { productFK, quantity = 1, restaurantFK } = req.body;

  if (!productFK || !restaurantFK) {
      return res.status(400).json({ message: "Missing required fields" });
  }

  try {
      const latestUserCartTrash = await CartTrash.findOne({ user, restaurantFK }).sort({ createdAt: -1 });
      const latestUserCartOrder = await CartOrder.findOne({ user, restaurantFK }).sort({ createdAt: -1 });

      const incrementQuantity = (cart, productFK) => {
          const productIndex = cart.productFK.findIndex(item => item.toString() === productFK);
          if (productIndex !== -1) {
              cart.quantityProduct[productIndex] += quantity;
              return true;
          }
          return false;
      };

      let cartTrashId;
      if (latestUserCartTrash && latestUserCartOrder) {
          const productExistsInTrash = incrementQuantity(latestUserCartTrash, productFK);
          const productExistsInOrder = incrementQuantity(latestUserCartOrder, productFK);

          if (!productExistsInTrash) {
              latestUserCartTrash.productFK.push(productFK);
              latestUserCartTrash.quantityProduct.push(quantity);
          }

          if (!productExistsInOrder) {
              latestUserCartOrder.productFK.push(productFK);
              latestUserCartOrder.quantityProduct.push(quantity);
          }

          await latestUserCartTrash.save();
          await latestUserCartOrder.save();

          cartTrashId = latestUserCartTrash._id;
      } else {
          const newCartItemOrder = new CartOrder({
              productFK,
              quantityProduct: [quantity],
              user,
              restaurantFK,
          });
          const newCartTrash = new CartTrash({
              productFK,
              quantityProduct: [quantity],
              user,
              restaurantFK,
          });
          await newCartItemOrder.save();
          await newCartTrash.save();

          cartTrashId = newCartTrash._id;
      }
console.log("cartTrashId", cartTrashId);
      return res.json({ cartId: cartTrashId });
  } catch (error) {
      return res.status(500).json({ message: "Internal Server Error", error });
  }
},
getCartTrashByUserweb: async (req, res) => {
  let total = 0;
  let subtotal = 0;
  let convertPromotion = 0;
  let convertedPrice = 0;
  let convertTPS = 0;
  let convertTVQ = 0;
  let convertedPriceTPS = 0;
  let convertedPriceTVQ = 0;

  // ObjectId constant pour les invités
  const guestObjectId = new mongoose.Types.ObjectId("000000000000000000000000");
  let user = guestObjectId;  // ID par défaut pour les invités

  const { userId } = req.params;  // Get userId from request parameters

  if (userId && userId !== "undefined" && userId.trim() !== "") {
      try {
          user = new mongoose.Types.ObjectId(userId);  // Use the userId passed in parameter
      } catch (error) {
          console.log("Invalid userId", error);
          user = guestObjectId;  // Continue as a guest if the ID is invalid
      }
  }


  try {
    const cartData = await CartTrash.find({ user })
      .sort({ createdAt: -1 })
      .populate('productFK')
      .populate('ingredientFK')
      .populate('itemsFK')
      .populate('restaurantFK');

  
    const restaurantId = cartData[0]?.restaurantFK._id;
    const restaurant = await Restaurant.findById(restaurantId);

    if (restaurant) {
      convertTPS = restaurant.taxeTPS / 100;
      convertTVQ = restaurant.taxeTVQ / 100;
    }

    cartData.forEach((item) => {
      item.productFK.forEach((product, index) => {
        let productPrice = product.price;
        if (product.promotion !== 0) {
          const discount = (product.promotion / 100) * productPrice;
          productPrice -= discount;
        }

        const itemPrice = item.itemsFK[index] ? item.itemsFK[index].price : 0;
        const productTotal = (productPrice + itemPrice) * item.quantityProduct[index];
        subtotal += productTotal;
      });
    });

    convertedPriceTPS = (subtotal * convertTPS).toFixed(2);
    convertedPriceTVQ = (subtotal * convertTVQ).toFixed(2);
    total = (subtotal + parseFloat(convertedPriceTPS) + parseFloat(convertedPriceTVQ)).toFixed(2);

    res.json({ cartData, total, convertedPriceTPS, convertedPriceTVQ });
  } catch (error) {
    console.error("Failed to retrieve cart", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
},


getCartOrderByUserweb: async (req, res) => {
  let total = 0;
  let convertPromotion = 0;
  let convertedPrice = 0;

  try {
    const { userId } = req.params;  // Récupérer userId depuis les paramètres de la requête
    const user = new mongoose.Types.ObjectId(userId);  // Utiliser l'ID utilisateur passé en paramètre

    const cartData = await CartOrder.find({ user }).sort({ createdAt: -1 })
      .populate("productFK")
      .populate("ingredientFK")
      .populate('itemsFK');

    cartData.forEach((item) => {
      for (let i = 0; i < item.productFK.length; i++) {
        if (item.productFK[i].promotion === 0 || item.ingredientFK[i]?.type === 'Required') {
          total = item.productFK[i].price * item.quantityProduct[i]
        } else {
          convertPromotion = item.productFK[i].promotion / 100;
          convertedPrice = item.productFK[i].price * convertPromotion;
          productPrice = item.productFK[i].price - convertedPrice;
          total = total + productPrice * item.quantityProduct[i]
        }
      }
    });

    res.send({ cartData, total, });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
},

// getCartTrashByUser: async (req, res) => {
//   let subtotal = 0;
//   let convertedPriceTPS = 0;
//   let convertPriceTVQ = 0;

//   try {
//       const tokenLogin = req.cookies.tokenLogin;
//       const decodeTokenLogin = jwt_decode(tokenLogin);
//       const idUser = decodeTokenLogin.id;

//       const cartData = await CartTrash.find({ user: idUser })
//           .sort({ createdAt: -1 })
//           .populate('productFK')
//           .populate('ingredientFK')
//           .populate('itemsFK')
//           .populate('restaurantFK');

//       if (!cartData.length) {
//           return res.status(404).json({ message: "Cart is empty" });
//       }

//       const restaurantId = cartData[0]?.restaurantFK;
//       const restaurant = await Restaurant.findOne({ "_id": restaurantId });

//       const convertTPS = restaurant ? restaurant.taxeTPS / 100 : 0;
//       const convertTVQ = restaurant ? restaurant.taxeTVQ / 100 : 0;

//       cartData.forEach((item) => {
//           item.productFK.forEach((product, index) => {
//               let productPrice = product.price;
//               if (product.promotion !== 0) {
//                   const discount = product.promotion / 100 * productPrice;
//                   productPrice -= discount;
//               }

//               const itemPrice = item.itemsFK[index] ? item.itemsFK[index].price : 0;
//               const productTotal = (productPrice + itemPrice) * item.quantityProduct[index];
//               subtotal += productTotal;
//           });
//       });

//       convertedPriceTPS = (subtotal * convertTPS).toFixed(2);
//       convertPriceTVQ = (subtotal * convertTVQ).toFixed(2);
//       const total = (subtotal + parseFloat(convertedPriceTPS) + parseFloat(convertPriceTVQ)).toFixed(2);

//       res.json({ cartData, total, convertedPriceTPS, convertPriceTVQ });
//   } catch (error) {
//       console.error("Failed to retrieve cart", error);
//       res.status(500).json({ message: "Internal Server Error", error });
//   }
// },



  removefromcartweb: async (req, res) => {
    try {
      const { id } = req.params;
      const cartItem = await Cart.findById(id);
      if (!cartItem) {
        return res.status(404).json({ message: "Not Product Found" });
      }
      await cartItem.deleteOne();
      res.json({ message: "Product is removed from cart" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  clearcartweb: async (req, res) => {
    try {
      const tokenLogin = req.cookies.tokenLogin;
      const decodeTokenLogin = jwt_decode(tokenLogin);
      const idUser = decodeTokenLogin.id;

      await CartTrash.find({ user: idUser }).deleteMany();
      await CartOrder.find({ user: idUser }).deleteMany(); // added by khalil
      res.json({ message: "Cart empty" });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" + error });
    }
  },

  clearcartwebs: async (req, res) => {
    const userId = req.params.userId; // Get user ID from request parameters
  
    try {
      await CartTrash.find({ user: userId }).deleteMany();
      await CartOrder.find({ user: userId }).deleteMany(); // added by khalil
  
      res.json({ message: "Cart empty" });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" + error });
    }
  },
  
  increasequantityProductInCartTrashweb: async (req, res) => {
    const userId = req.params.userId;
    const productFK = req.params.productFK;
    try {
        const product = await Product.findById(productFK);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        const cartItemTrash = await CartTrash.findOne({ user: userId });
        if (!cartItemTrash) {
            return res.status(404).json({ error: "Cart trash not found" });
        }

        const productIndexTrash = cartItemTrash.productFK.findIndex(item => item.toString() === productFK);
        if (productIndexTrash === -1) {
            return res.status(404).json({ error: "Product not found in cart trash" });
        }

        cartItemTrash.quantityProduct[productIndexTrash] += 1;
        await cartItemTrash.save();

        res.json({ message: "Product quantity increased", cartItemTrash });
    } catch (error) {
        console.error("Error increasing product quantity in cart trash:", error);
        res.status(500).json({ message: "Internal Server Error", error });
    }
  },
    
  decreaseQuantityProductInCartTrashweb : async (req, res) => {
    const userId = req.params.userId;
    const productFK = req.params.productFK;
    try {
        const product = await Product.findById(productFK);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        const cartItemTrash = await CartTrash.findOne({ user: userId });
        if (!cartItemTrash) {
            return res.status(404).json({ error: "Cart trash not found" });
        }

        const productIndexTrash = cartItemTrash.productFK.findIndex(item => item.toString() === productFK);
        if (productIndexTrash === -1) {
            return res.status(404).json({ error: "Product not found in cart trash" });
        }

        if (cartItemTrash.quantityProduct[productIndexTrash] > 1) {
            cartItemTrash.quantityProduct[productIndexTrash] -= 1;
            await cartItemTrash.save();
            res.json({ message: "Product quantity decreased", cartItemTrash });
        } else {
            res.status(400).json({ error: "Product quantity cannot be less than 1" });
        }
    } catch (error) {
        console.error("Error decreasing product quantity in cart trash:", error);
        res.status(500).json({ message: "Internal Server Error", error });
    }
  },
  increaseQuantityProductInCartOrderweb: async (req, res) => {
    const guestObjectId = new mongoose.Types.ObjectId("000000000000000000000000");
    let user = guestObjectId;  // Default ID for guests
  
    const { userId } = req.params;  // Get userId from request parameters
  
    if (userId && userId !== "undefined" && userId.trim() !== "") {
      try {
        user = new mongoose.Types.ObjectId(userId);  // Use the user ID from the request parameters
      } catch (error) {
        console.log("Invalid userId", error);
        // Continue as a guest if the userId is invalid
        user = guestObjectId;
      }
    }
  
    try {
      const productFK = req.params.productFK;
      const idCartOrder = req.params.idCartOrder;
  
      // Attempt to find the cart for the user or guest
      const cartOrder = await CartOrder.findOne({ user: user })
        .sort({ createdAt: -1 })
        .populate("productFK")
        .populate("ingredientFK")
        .populate("itemsFK");
  
      if (!cartOrder) {
        return res.status(404).json({ error: "Cart not found" });
      }
  
      const productIndexOrder = cartOrder.productFK.findIndex(
        (item) => item._id.toString() === productFK
      );
  
      if (productIndexOrder === -1) {
        return res.status(404).json({ error: "Product not found in the cart" });
      } else {
        cartOrder.quantityProduct[productIndexOrder] += 1; // Increment the product quantity
        await cartOrder.save();
        res.json({ message: "Product quantity increased", cart: cartOrder });
      }
    } catch (error) {
      console.error("Failed to increase product quantity:", error);
      res.status(500).json({ error: error.message });
    }
  },
 decreaseQuantityProductInCartOrderweb : async (req, res) => {
    const guestObjectId = new mongoose.Types.ObjectId("000000000000000000000000");
    let user = guestObjectId;  // Default ID for guests
  
    const { userId } = req.params;  // Get userId from request parameters
  
    if (userId && userId !== "undefined" && userId.trim() !== "") {
      try {
        user = new mongoose.Types.ObjectId(userId);  // Use the user ID from the request parameters
      } catch (error) {
        console.log("Invalid userId", error);
        user = guestObjectId;  // Continue as a guest if the userId is invalid
      }
    }
  
    try {
      const productFK = req.params.productFK;
  
      // Find the product
      const product = await Product.findById(productFK);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
  
      // Find the cart for the user or guest
      const cartOrder = await CartOrder.findOne({ user: user })
        .sort({ createdAt: -1 })
        .populate("productFK")
        .populate("ingredientFK")
        .populate("itemsFK");
  
      if (!cartOrder) {
        return res.status(404).json({ error: "Cart not found" });
      }
  
      const productIndexOrder = cartOrder.productFK.findIndex(
        (item) => item._id.toString() === productFK
      );
  
      if (productIndexOrder === -1) {
        return res.status(404).json({ error: "Product not found in the cart" });
      }
  
      // Handle the situation where the quantity would go to zero
      if (cartOrder.quantityProduct[productIndexOrder] > 1) {
        cartOrder.quantityProduct[productIndexOrder] -= 1;
        await cartOrder.save();
        res.json({ message: "Product quantity decreased", cart: cartOrder });
      } else {
        // Remove the product from the cart if the quantity is 1
        cartOrder.productFK.splice(productIndexOrder, 1);
        cartOrder.quantityProduct.splice(productIndexOrder, 1);
        await cartOrder.save();
        res.json({ message: "Product removed from cart", cart: cartOrder });
      }
    } catch (error) {
      console.error("Failed to decrease product quantity:", error);
      res.status(500).json({ error: error.message });
    }
  },



  deleteProductByIdweb: async (req, res) => {
    const guestObjectId = new mongoose.Types.ObjectId("000000000000000000000000");
    let user = guestObjectId;  // Default ID for guests
  
    const { userId } = req.params;  // Get userId from request parameters
  
    if (userId && userId !== "undefined" && userId.trim() !== "") {
      try {
        user = new mongoose.Types.ObjectId(userId);  // Use the user ID from the request parameters
      } catch (error) {
        console.log("Invalid userId", error);
        // Continue as a guest if the userId is invalid
        user = guestObjectId;
      }
    }
  
    try {
      const productId = req.params.productId;
  
      // Find carts for the user or guest
      const cartOrder = await CartOrder.findOne({ user: user, "productFK": productId });
      const cartTrash = await CartTrash.findOne({ user: user, "productFK": productId });
  
      if (!cartOrder && !cartTrash) {
        return res.status(404).json({ message: "Product not found in any cart" });
      }
  
      // Pull product from productFK array in both CartOrder and CartTrash
      if (cartOrder) {
        await CartOrder.updateOne({ _id: cartOrder._id }, { $pull: { productFK: productId } });
      }
      if (cartTrash) {
        await CartTrash.updateOne({ _id: cartTrash._id }, { $pull: { productFK: productId } });
      }
  
      res.json({ message: "Product removed from cart successfully." });
    } catch (error) {
      console.error("Failed to remove product from cart:", error);
      res.status(500).json({ error: error.message });
    }
  },
  
// addtocart: async (req, res) => {
// },

 getCartTrashByUser: async (req, res) => { //changed
  let total = 0;
  let subtotal = 0;
  let convertPromotion = 0;
  let convertedPrice = 0;
  let convertTPS = 0;
  let convertTVQ = 0;
  let convertedPriceTPS = 0;
  let convertPriceTVQ =0;

  try {
    const tokenLogin = req.cookies.tokenLogin;
    const decodeTokenLogin = jwt_decode(tokenLogin);
    const idUser = decodeTokenLogin.id;

    const cartData = await CartTrash.find({ user: idUser })
    .sort({ createdAt: -1 })
    .populate('productFK')
    .populate('ingredientFK')
    .populate('itemsFK')
    .populate('restaurantFK')
        
    
    

    const restaurantId = cartData[0]?.restaurantFK;
    const restaurant = await Restaurant.findOne({ "_id": restaurantId });

    convertTPS = restaurant && restaurant.taxeTPS / 100;
    convertTVQ = restaurant && restaurant.taxeTVQ / 100;
  
    cartData.forEach((item) => {
      for (let i = 0; i < item.productFK.length; i++) {
        if (item.productFK[i].promotion === 0 || item.ingredientFK[i]?.type === 'Required') {

          total = item.productFK[i].price * item.quantityProduct[i];
          convertedPriceTPS = total * convertTPS;
          convertPriceTVQ = total * convertTVQ;
          total = total + convertedPriceTPS + convertPriceTVQ;

        } else {
          convertPromotion = item.productFK[i].promotion / 100;
          convertedPrice = item.productFK[i].price * convertPromotion;
          productPrice = item.productFK[i].price - convertedPrice;
          productItemprice = productPrice + item.itemsFK[i]?.price

          if (item.itemsFK[i]) {
            total = total + productPrice * item.quantityProduct[i] + item.itemsFK[i].price
            convertedPriceTPS = total * convertTPS;
            convertPriceTVQ = total * convertTVQ;
            total = total + convertedPriceTPS + convertPriceTVQ;

          } else {
            total = total + productPrice * item.quantityProduct[i]
            convertedPriceTPS = total * convertTPS;
            convertPriceTVQ = total * convertTVQ;
            total = total + convertedPriceTPS + convertPriceTVQ;
          }
        }
      }
      convertedPriceTPS = (total * convertTPS).toFixed(2);
      convertPriceTVQ = (total * convertTVQ).toFixed(2);       
      total = total.toFixed(2)
     
     
     
    });

    res.json({ cartData, total, convertedPriceTPS, convertPriceTVQ});
  
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
},

getCartOrderByUser: async (req, res) => {
  let total = 0;
  let convertPromotion = 0;
  let convertedPrice = 0;

  try {
    const tokenLogin = req.cookies.tokenLogin;
    const decodeTokenLogin = jwt_decode(tokenLogin);
    const idUser = decodeTokenLogin.id;

    const cartData = await CartOrder.find({ user: idUser }).sort({ createdAt: -1 })
      .populate("productFK")
      .populate("ingredientFK")
      .populate('itemsFK');

    cartData.forEach((item) => {
      for (let i = 0; i < item.productFK.length; i++) {
        if (item.productFK[i].promotion === 0 || item.ingredientFK[i]?.type === 'Required') {
          total = item.productFK[i].price * item.quantityProduct[i]
        } else {
          convertPromotion = item.productFK[i].promotion / 100;
          convertedPrice = item.productFK[i].price * convertPromotion;
          productPrice = item.productFK[i].price - convertedPrice;
          total = total + productPrice * item.quantityProduct[i]
        }
      }
    });

    res.send({ cartData, total, });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
},

removefromcart: async (req, res) => {
  try {
    const { id } = req.params;
    const cartItem = await Cart.findById(id);
    if (!cartItem) {
      return res.status(404).json({ message: "Not Product Found" });
    }
    await cartItem.deleteOne();
    res.json({ message: "Product is removed from cart" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
},

clearcart: async (req, res) => {
  try {
    const tokenLogin = req.cookies.tokenLogin;
    const decodeTokenLogin = jwt_decode(tokenLogin);
    const idUser = decodeTokenLogin.id;

    await CartTrash.find({ user: idUser }).deleteMany();
    await CartOrder.find({ user: idUser }).deleteMany(); // added by khalil
    res.json({ message: "Cart empty" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" + error });
  }
},


increasequantityProductInCartTrash: async (req, res) => {
  const productFK = req.params.productFK;
  const idCartTrash = req.params.idCartTrash;
  try {
    const product = await Product.findById(productFK);

    const cartItemTrash = await CartTrash.findById(idCartTrash);

    if (!product) {
      return res.status(404).json({ error: "Not Product Found" });
    }

    const productIndexTrash = cartItemTrash.productFK.findIndex(item => item.toString() === productFK);

    cartItemTrash.quantityProduct[productIndexTrash] += 1;
    await cartItemTrash.save();
    res.json({ message: "Product quantity is increased" });

  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
},

increasequantityProductInCartOrder: async (req, res) => {
  const tokenLogin = req.cookies.tokenLogin;
  const decodeTokenLogin = jwt_decode(tokenLogin);
  const idUser = decodeTokenLogin.id;

  const productFK = req.params.productFK;
  const idCartOrder = req.params.idCartOrder;

  try {
    const product = await Product.findById(productFK);
    const idCart = await CartOrder.findOne({ user: idUser })
      .sort({ createdAt: -1 })
      .populate("productFK")
      .populate("ingredientFK")
      .populate("itemsFK");

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const productIndexOrder = idCart.productFK.findIndex(
      (item) => item._id.toString() === productFK
    );

    if (productIndexOrder === -1) {
      return res.status(404).json({ error: "Product not found in the cart" });
    }
    else {
      idCart.quantityProduct[productIndexOrder] += 1;
    }

    await idCart.save();

    res.json({ message: "Product quantity is increased" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
},

decreasequantityProductInCartTrash: async (req, res) => {
  const productFK = req.params.productFK;
  const idCartTrash = req.params.idCartTrash;
  try {
    const product = await Product.findById(productFK);

    const cartItemTrash = await CartTrash.findById(idCartTrash);

    if (!product) {
      return res.status(404).json({ error: "Not Product Found" });
    }

    const productIndexTrash = cartItemTrash.productFK.findIndex(item => item.toString() === productFK);

    if (cartItemTrash.quantityProduct[productIndexTrash] > 1) {

      cartItemTrash.quantityProduct[productIndexTrash] -= 1;
      await cartItemTrash.save();
      res.json({ message: "Product quantity is decreased" });
    } else {
      res.send({ message: "Product quantity can not be less than 1" });
    }

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
},

decreasequantityProductInCartOrder: async (req, res) => {
  const tokenLogin = req.cookies.tokenLogin;
  const decodeTokenLogin = jwt_decode(tokenLogin);
  const idUser = decodeTokenLogin.id;

  const productFK = req.params.productFK;
  const idCartOrder = req.params.idCartOrder;

  try {
    const product = await Product.findById(productFK);
    const idCart = await CartOrder.findOne({ user: idUser })
      .sort({ createdAt: -1 })
      .populate("productFK")
      .populate("ingredientFK")
      .populate("itemsFK");

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const productIndexOrder = idCart.productFK.findIndex(
      (item) => item._id.toString() === productFK
    );

    if (productIndexOrder === -1) {
      return res.status(404).json({ error: "Product not found in the cart" });
    }
    else {
      idCart.quantityProduct[productIndexOrder] -= 1;
    }

    await idCart.save();

    res.json({ message: "Product quantity is decreased" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
},
  deleteProductById: async (req, res) => { //changed by khalil
  try {
    const tokenLogin = req.cookies.tokenLogin;
    const decodeTokenLogin = jwt_decode(tokenLogin);
    const idUser = decodeTokenLogin.id;

    const productId = req.params.productId;

    const cartOrder = await CartOrder.findOne({ user: idUser }).sort({ createdAt: -1 });
    const cartTrash = await CartTrash.findOne({ user: idUser }).sort({ createdAt: -1 });

    const ingredientIds = cartOrder.ingredientFK.map(ingredient => ingredient?._id);
    const itemIds = cartOrder.itemsFK.map(item => item?._id);
    const quantityCartOrder = cartOrder.quantityProduct.map(quantityProduct => quantityProduct?._id);

    const ingredientIdsTrash = cartTrash.ingredientFK.map(ingredient => ingredient?._id);
    const itemIdsTrash = cartTrash.itemsFK.map(item => item?._id);
    const quantityCartTrash = cartTrash.quantityProduct.map(quantityProduct => quantityProduct?._id);

    await CartOrder.deleteMany({ _id: { $in: ingredientIds }, productFK: productId });

    await CartTrash.deleteMany({ _id: { $in: ingredientIdsTrash }, productFK: productId });

    await CartOrder.deleteMany({ _id: { $in: itemIds }, productFK: productId });

    await CartTrash.deleteMany({ _id: { $in: itemIdsTrash }, productFK: productId });

    await CartOrder.deleteMany({ _id: { $in: quantityCartOrder }, productFK: productId });

    await CartTrash.deleteMany({ _id: { $in: quantityCartTrash }, productFK: productId });

    await CartTrash.updateOne(
      { user: idUser },
      { $pull: { productFK: productId } }
    );
    await CartOrder.updateMany(
      { user: idUser },
      { $pull: { productFK: productId } }
    );

    await CartOrder.updateOne(
      { user: idUser, productFK: productId },
      { $pull: { quantityProduct: { _id: { $in: quantityCartOrder } } } }
    );

    await CartTrash.updateOne(
      { user: idUser, productFK: productId },
      { $pull: { quantityProduct: { _id: { $in: quantityCartTrash } } } }
    );

    res.json({ message: "Product is removed from cart" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" + error });
  }
}



}
module.exports = CartController;