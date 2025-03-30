const fs = require("fs");
const path = require("path");
const Category = require("../models/category.model");
const User = require('../models/user.model');
const Menu = require("../models/menu.model");
const Restaurant = require('../models/restaurant.model');

const jwt_decode = require("jwt-decode");


async function findRestaurantByOwnerId(ownerId) {
  try {
  
    let idUser = ownerId;
    let user =await User.findById(idUser)
    if (user.role=="employee"){
      idUser=user.owner
    }

      const restaurant = await Restaurant.findOne({ owner: idUser }).populate('owner');
      return restaurant;
  } catch (error) {
      console.error('Error finding restaurant by owner ID:', error);
      throw error;
  }
}
const categoryController = {
  addNew: async (req, res) => {
    try {
      const menu = req.params.menu;
      const { libelle, description, photo} = req.body;
      const newCategory = new Category({ libelle, description, photo, menu });
      const savedCategory = await newCategory.save();
      return res.status(201).json({ data: savedCategory });
    } catch (error) {
      return res.status(500).json({ message: error });
    }
  },

  createNew: async (req, res) => {
    try {
     // const menu = req.params.menu;
     const photo = req.file.filename;
      const { libelle, description, menu} = req.body;
      const newCategory = new Category({ libelle, description, photo, menu });
      const savedCategory = await newCategory.save();
      return res.status(201).json({ data: savedCategory });
    } catch (error) {
      console.log(error+"error");
      return res.status(500).json({ message: error });
    }
  },

  retrieveAll: async (req, res) => {
    try {
      req = null;
      await Category.find()
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

  retrieveByMenuId: async (req, res) => {
    try {
      const menu = req.params.menu;
      if (!menu || menu.trim() === "") {
        return res.status(400).json({ error: "Menu parameter is missing or empty" });
      }
  
   
      const mongoose = require("mongoose");
      const isValidObjectId = mongoose.isValidObjectId(menu);
      if (!isValidObjectId) {
        return res.status(400).json({ error: "Menu parameter is not a valid ObjectId" });
      }
  
      const categories = await Category.find({ menu: menu });
      if (categories.length > 0) {
        res.json(categories);
      } else {
        res.status(404).json({ error: "No categories found for menu: " + menu });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  
  


  retrieveById: async (req, res) => {
    try {
      const id = req.params.id;
      await Category.findById(id)
        .then((data) => {
          res.json(data);
        })
        .catch(() => {
          res
            .status(400)
            .json({ error: "Could not find category with id " + id });
        });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  },

  deleteById: async (req, res) => {
    try {
      const category = await Category.findByIdAndDelete(req.params.id);
      if(!category){
        res.status(404).json({ message: "Could not find any category with name of "+category?.libelle });
      }
      fs.unlinkSync(path.join(__dirname,"../uploads/category/", category?.photo));
       
      res.status(200).json({
        message:"This operation has been achieved with success. You have deleted an item with id" +req.params.id+". "+
        "Please note that the photo of this category with name of "+category?.photo+" has been deleted from your local server."
      });
    } catch (error) {
        res.json(error);
    }
  },

  updateById: async (req, res) => {
    try {
      const { libelle, description,menu } = req.body;
      const photo = req.file.filename;
      const category = await Category.findById(req.params.id);
      category.libelle = libelle;
      category.description = description;
      category.photo = photo;
      category.menu = menu;
      const saved = await category.save();
      res.json(saved);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  },

  updatePhotoById: async (req, res) => {
    try {
      const { photo } = req.body;
      const category = await Category.findById(req.params.id);
      category.photo = photo;
      const saved = await category.save();
      res.json(saved);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  },

  enableCategoryById: async (req, res) => {
    try {
      const { visibility = "ENABLE" } = req.body;
      const category = await Category.findById(req.params.id);
      category.visibility = visibility;
      const saved = await category.save();
      res.json(saved);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  },

  disableCategoryById: async (req, res) => {
    try {
      const { visibility = "DISABLE" } = req.body;
      const category = await Category.findById(req.params.id);
      category.visibility = visibility;
      const saved = await category.save();
      res.json(saved);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  },

  retrieveWhereVisibilityIsEqualToENABLE: async (req, res) => {
    try {
      const menu = req.params.menu;
      await Category.find({ menu: menu, visibility: "ENABLE" })
        .then((data) => {
          res.json(data);
        })
        .catch((error) => {

          res.status(400).json({ message: "no category with this menu" + error });
        });
    } catch (error) {
      res.status(500).json({ message: " opps "+error });
    }
  },

  retrieveWhereVisibilityIsEqualToDISABLE: async (req, res) => {
    try {
      const menu = req.params.menu;
      await Category.find({ menu: menu,visibility: "DISABLE" })
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
  createCategoryForRestaurant: async (req, res) => {
 
    const { libelle, description,userId} = req.body;
  

    const restaurant = await findRestaurantByOwnerId(userId);
    const restaurantFK = restaurant._id;

    try {
      // Find menus by restaurantFK
      const menus = await Menu.findOne({ restaurantFK: restaurantFK });
     

      const menu = menus._id ;
     

     const photo = req.file.filename;
      const newCategory = new Category({ libelle, description, photo, menu });
      const savedCategory = await newCategory.save();
      return res.status(201).json({ data: savedCategory });
    } catch (error) {
      console.log(error+"error");
      return res.status(500).json({ message: error });
    }
  },

  retrieveRestaurantByIdUser: async (req, res) => {
 
    let userId = req.params.id

    const restaurant = await findRestaurantByOwnerId(userId);
  
    const restaurantFK = restaurant._id;
    //console.log("id resto"+restaurant._id)

    try {
      // Find menus by restaurantFK
      const menus = await Menu.findOne({ restaurantFK: restaurantFK });
     

      const menu = menus._id ;
     

     const categories = await Category.find({ menu: menu }).exec();
    if (!categories) {
      return res.status(400).json({ error: "Could not find categories for menu with id " + menu });
    }

    res.json(categories);
    } catch (error) {
      console.log(error+"error");
      return res.status(500).json({ message: error });
    }
  },
  retrieveByMenuIds: async (req, res) => {
      
    try {
      const menuId = req.params.menu;
      if (!menuId) {
        return res.status(400).json({ error: "Menu ID is missing" });
      }
  
      const categories = await Category.find({ menu: menuId });
      if (categories.length > 0) {
        res.json(categories);
      } else {
        res.status(404).json({ error: "No categories found for menu: " + menuId });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};
exports.getCategoriesByMenuId = async (req, res) => {
  try {
    const { menuId } = req.params;

    const categories = await Category.find({ menu: menuId });

    if (!categories || categories.length === 0) {
      return res.status(404).json({ success: false, message: 'No categories found for this menu' });
    }

    return res.status(200).json({ success: true, data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};
module.exports = categoryController;
