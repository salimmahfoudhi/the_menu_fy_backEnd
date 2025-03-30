const fs = require("fs");
const path = require("path");
const Product = require("../models/product.model");
const Category = require("../models/category.model");
const User = require("../models/user.model");
const mongoose = require('mongoose');

const productController = {
addNew: async (req, res) => {
  try {
    const categoryFK = req?.params?.categoryFK;
    let priceWithPromotion;
    const {
      name,
      photo,
      description,
      price,
      disponibilityDuration,
      promotion,
    } = req.body;

    // Create a new product object
    const newProduct = new Product({
      name,
      photo,
      description,
      price,
      disponibilityDuration,
      promotion: promotion || 0,  // Ensure promotion has a default of 0 if not provided
      categoryFK,
    });

    // Calculate price with promotion if applicable
    if (promotion > 0) {
      const convertPromotion = promotion / 100;
      const convertedPrice = price * convertPromotion;
      priceWithPromotion = (price - convertedPrice).toPrecision(6);
    } else {
      // Handle non-promotional scenario explicitly
      priceWithPromotion = price.toPrecision(6);  // Still provide the precision price for consistency
    }

    // Save the new product
    const saved = await newProduct.save();
    return res.status(201).json({ data: saved, priceWithPromotion: priceWithPromotion });
  } catch (error) {
    return res.status(500).json({ message: error.toString() });
  }
},


  createNew: async (req, res) => {
    try {
      const {
        name,
        description,
        price,
        promotion,
        categoryFK
      } = req.body;
  
      if (promotion < 0) {
        return res.status(400).json({
          message: "La valeur de la promotion est inférieure à 0. Veuillez fournir une promotion valide."
        });
      }
  
      const convertPromotion = promotion / 100;
      const convertedPrice = price * convertPromotion;
      const priceWithPromotion = (price - convertedPrice).toPrecision(6);
  
      const photo = req?.file?.filename; // Photo principale

      const newProduct = new Product({
        name,
        photo,
        description,
        price,
        promotion,
        categoryFK,
    //    photos
      });
  
      const savedProduct = await newProduct.save();
  
      return res.status(201).json({
        data: savedProduct,
        priceWithPromotion: priceWithPromotion
      });
    } catch (error) {
      console.error("Erreur lors de l'ajout du produit :", error);
      return res.status(500).json({ message: "Erreur interne du serveur." });
    }
  },
  

  createNew: async (req, res) => {
    try {
      const {
        name,
        description,
        price,
        promotion,
        categoryFK
      } = req.body;
  
      if (promotion < 0) {
        return res.status(400).json({
          message: "La valeur de la promotion est inférieure à 0. Veuillez fournir une promotion valide."
        });
      }
  
      const convertPromotion = promotion / 100;
      const convertedPrice = price * convertPromotion;
      const priceWithPromotion = (price - convertedPrice).toPrecision(6);
  
      const photo = req?.file?.filename; // Photo principale

      const newProduct = new Product({
        name,
        photo,
        description,
        price,
        promotion,
        categoryFK,
    //    photos
      });
  
      const savedProduct = await newProduct.save();
  
      return res.status(201).json({
        data: savedProduct,
        priceWithPromotion: priceWithPromotion
      });
    } catch (error) {
      console.error("Erreur lors de l'ajout du produit :", error);
      return res.status(500).json({ message: "Erreur interne du serveur." });
    }
  },
  

  retrieveAll: async (req, res) => {
    try {
      const page = req.query.page || 1;
      const limit = req.query.limit || 10;
      const skip = (page - 1) * limit;

     // const count = await Product.find().populate("categoryFK");
      await Product.find().populate("categoryFK")
       // .skip(skip)
       // .limit(limit)
        .then((data) => {
          res.json({
            data : data,
            
          });
        })
        .catch((error) => {
          res.status(400).json({ message: error });

        });
    } catch (error) {
      res.status(500).json({ message: error });
    }
  },

  retrieveById: async (req, res) => {
    try {
      const id = req.params.id;
      await Product.findById(id).populate("categoryFK")
        .then((data) => {
          res.json(data);
        })
        .catch(() => {
          res
            .status(400)
            .json({ error: "Could not find product with id " + id });
        });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  },
  retrieveAllByMenu: async (req, res) => {
    try {
        const menuId = req.params.id;
        
        const categories = await Category.find({ menu: menuId }).select('_id');
        const categoryIds = categories.map(category => category._id);

        // Step 2: Fetch products for those categories
        await Product.find({ categoryFK: { $in: categoryIds } }).populate("categoryFK")
            .then((data) => {
                res.json({
                    data: data,
                });
            })
            .catch((error) => {
                res.status(400).json({ message: error.message });
            });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
},


  retrieveByProductId: async (req, res) => {
    try {
      const id = req.params.id;
      await Product.findById(menu)
        .then((data) => {
          res.json(data);
        })
        .catch(() => {
          res.status(400).json({
            error: "Could not find product in this menu with id " + id,
          });
        });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  },

  deleteById: async (req, res) => {
    try {
      const product = await Product.findByIdAndDelete(req.params.id);
      if (!product) {
        res.status(404).json({
          message: "Could not find any product with name of " + product?.name,
        });
      }
      fs.unlinkSync(
        path.join(__dirname, "../uploads/product/", product?.photo)
      );

      res.status(200).json({
        message:
          "This operation has been achieved with success. You have deleted an item with id" +
          req.params.id +
          ". " +
          "Please note that the photo of this product with name of " +
          product?.photo +
          " has been deleted from your local server.",
      });
    } catch (error) {
      res.json(error);
    }
  },

  updateById: async (req, res) => {
    try {
      const { name, description, price, disponibilityDuration, promotion, visibility, categoryFK } =
        req.body;

    //  const photos = req?.file.filename;
    //  const gif_ = req?.file?.filename;
      const photo = req?.file?.filename;
      let convertPromotion = 0;
      let convertedPrice = 0;
      let priceWithPromotion = 0;
    //  if (promotion != 0) {
        convertPromotion = promotion / 100;
        convertedPrice = price * convertPromotion;
        priceWithPromotion = (price - convertedPrice).toPrecision(6);
     // } else {
    //    return res.status(500).json({
    //      message:
    //        "The promotion value is equal to 0. This product does not have a reduction. So the product price still unchange.",
    //    });
   //   }
      const product = await Product.findById(req.params.id);
      product.name = name;
      product.description = description;
      product.price = price;
      product.disponibilityDuration = disponibilityDuration;
      product.promotion = promotion;
      product.photo = photo;
      product.visibility = visibility;
      product.categoryFK = categoryFK;
   //   product.gif_ = gif_;

      const saved = await product.save();
      res.json({ saved, priceWithPromotion: priceWithPromotion });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  },
  getProductByName: async (req, res) => {
    try {
      const { name } = req.params;
      const product = await Product.findOne({ name: new RegExp(`^${name}$`, 'i') }).populate("categoryFK");
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  },
  updatePhotoById: async (req, res) => {
    try {
      const { photo } = req.body;
      const product = await Product.findById(req.params.id);
      product.photo = photo;
      const saved = await product.save();
      res.json(saved);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  },
  enableProductById: async (req, res) => {
    try {
      const { visibility = "ENABLE" } = req.body;
      const product = await Product.findById(req.params.id);
      product.visibility = visibility;
      const saved = await product.save();
      res.json(saved);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  },

  disableProductById: async (req, res) => {
    try {
      const { visibility = "DISABLE" } = req.body;
      const product = await Product.findById(req.params.id);
      product.visibility = visibility;
      const saved = await product.save();
      res.json(saved);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  },
  retrieveWhereVisibilityIsEqualToENABLE: async (req, res) => {
    try {
      await Product.find({ visibility: "ENABLE" })
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

  retrieveWhereVisibilityIsEqualToDISABLE: async (req, res) => {
    try {
      req = null;
      await Product.find({ visibility: "DISABLE" })
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

  retrieveEnabledProductsByCategory: async (req, res) => {
    try {
      const categoryFK = req?.params?.categoryFK;
      await Product.find({visibility : "ENABLE",categoryFK})
        .then((data) => {
          res.status(201).json(data);
        })
        .catch((error) => {
          res.status(400).json({ message: error });
        });
    } catch (error) {
      res.status(500).json({ message: error });
    }
  },
  retrieveByCategoryIds: async (req, res) => {
    try {
      const { categoryIds } = req.body; // Expecting an array of category IDs in the request body
      if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
        return res.status(400).json({ error: "Invalid category IDs." });
      }
  
      const products = await Product.find({ categoryFK: { $in: categoryIds } }).populate("categoryFK");
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  },
  fetchProductIdsByCategory: async (req, res) => {
    try {
      const { category } = req.params; // Extract category from request parameters

      // Query the database to find products by category and retrieve only their IDs
      const products = await Product.find({ categoryFK: category }, "_id");

      // Extract product IDs from the retrieved products
      const productIds = products.map(product => product._id);

      // Return product IDs as JSON response
      res.json({ productIds });
    } catch (error) {
      console.error("Error fetching product IDs:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  addProductToWishList : async (req, res) => {
    try {
      const userId = req.params.userId;
      const productId = req.params.productId;
  
      // Validate userId and productId
      if (!userId || !productId) {
        return res.status(400).json({ message: "User ID and Product ID are required" });
      }
  
      if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ message: "Invalid User ID or Product ID format" });
      }
  
      console.log(`Fetching user with ID: ${userId}`);
      const user = await User.findById(userId);
      console.log(`User found: ${user}`);
  
      console.log(`Fetching product with ID: ${productId}`);
      const product = await Product.findById(productId);
      console.log(`Product found: ${product}`);
  
      if (!user) {
        console.log("User not found");
        return res.status(404).json({ message: "User not found" });
      }
      if (!product) {
        console.log("Product not found");
        return res.status(404).json({ message: "Product not found" });
      }
  
      if (!user.wishList.includes(productId)) {
        console.log("Adding product to user's wishlist");
        user.wishList.push(productId);
        await user.save();
      } else {
        console.log("Product already in wishlist");
      }
  
      res.json({ message: "Product added to wish list" });
    } catch (err) {
      console.error('Server error:', err);
      res.status(500).json({ message: "Server error" });
    }
  },
  // Get the user's wishlist
  getUserWishList : async (req, res) => {
    try {
      const userId = req.params.userId;
      const user = await User.findById(userId).populate('wishList');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.status(200).json(user.wishList);
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ message: "Server error" });
    }
  },
  
  // Toggle a product in the user's wishlist
   toggleWishlist : async (req, res) => {
    const { userId, productId } = req.params;
    
    try {
      const user = await User.findById(userId);
      const product = await Product.findById(productId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      const index = user.wishList.indexOf(productId);
      if (index === -1) {
        // Product is not in wishlist, add it
        user.wishList.push(productId);
        await user.save();
        res.status(200).json({ message: "Product added to wishlist", isFavorited: true });
      } else {
        // Product is in wishlist, remove it
        user.wishList.splice(index, 1);
        await user.save();
        res.status(200).json({ message: "Product removed from wishlist", isFavorited: false });
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  similarProducts : async (req, res, next) => {
    let products;
    const productId = req.params.productId;
    try {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: "No product found" });
      }
      const category = product.categoryFK; // Assurez-vous que c'est le bon champ pour la catégorie
      products = await Product.find({ categoryFK: category, _id: { $ne: productId } });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "Internal server error" });
    }
    return res.status(200).json({ products });
  },
  retrieveProductsByMenu: async (req, res) => {
    try {
      const menuId = req.query.menuId; // Récupérer l'ID du menu depuis la requête
      const page = req.query.page || 1;
      const limit = req.query.limit || 10;
      const skip = (page - 1) * limit;
  
      await Product.find({ menu: menuId }) // Filtrer les produits par menu
        .populate("categoryFK")
        .then((data) => {
          res.json({
            data: data,
          });
        })
        .catch((error) => {
          res.status(400).json({ message: error });
        });
    } catch (error) {
      res.status(500).json({ message: error });
    }
  },
  filterProductsByPrice : async (req, res) => {
    try {
      const { minPrice, maxPrice } = req.query;
      const products = await Product.find({
        price: { $gte: minPrice, $lte: maxPrice },
      });
      res.json(products);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};


module.exports = productController;