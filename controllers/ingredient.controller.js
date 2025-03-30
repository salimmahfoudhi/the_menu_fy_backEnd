const Ingredient = require("../models/ingredient.model");


const ingredientController = {

  addNew: async (req, res) => {
    try {
      const productFK = req?.params?.productFK;
      const { libelle, type, quantity, price, qtMax } = req.body;
      const newIngredient = new Ingredient({
        libelle,
        type,
        quantity,
        price,
        productFK,
        qtMax
      });
      if (type === "Supplement" && price == 0) {
        res
          .status(400)
          .json({
            error:
              "Cannot save item with type equal to extra because his price should be not equal to 0 (extra).",
          });
      } else if (type === "Ingredient" && price != 0) {
        res
          .status(400)
          .json({
            error:
              "Cannot save item with type equal to ingredient because his price should be equal to 0 (free).",
          });
      } else {
        const saved = await newIngredient.save();
        return res.status(201).json({ data: saved });
      }
    } catch (error) {
      return res.status(500).json({ message: error });
    }
  },

  createNew: async (req, res) => {
    try {
    //  const productFK = req?.params?.productFK;
      const img = req?.file?.filename;
      const { libelle, type,minNbOfSelectedItem,maxNbOfSelectedItem,isExtra, quantity, price, qtMax ,productFK} = req.body;
      const newIngredient = new Ingredient({
        libelle,
        img,
        type,
        minNbOfSelectedItem,
        maxNbOfSelectedItem,
        isExtra,
        quantity,
        price,
        productFK,
        qtMax
      });
     
        const saved = await newIngredient.save();
        return res.status(201).json({ data: saved });
      
    } catch (error) {
      return res.status(500).json({ message: error });
    }
  },
  
  retrieve: async (req, res) => {
    try {
      req = null;
      await Ingredient.find()
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

  retrieveAll: async (req, res) => {
    try {
      const productFK = req.params.productFK
      await Ingredient.find({productFK: productFK})
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

  retrieveGroupByType: async (req, res) => {
    try {
      req = null;
      await Ingredient.aggregate([
        { $group: { _id: "$type", data: { $push: "$$ROOT" } } },
      ])
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

  retrieveById: async (req, res) => {
    try {
      const id = req.params.id;
      await Ingredient.findById(id)
        .then((data) => {
          res.json(data);
        })
        .catch(() => {
          res
            .status(400)
            .json({ error: "Could not find ingredient with id " + id });
        });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  },

  deleteById: async (req, res) => {
    try {
      const ingredient = await Ingredient.findByIdAndDelete(req.params.id);
      if (!ingredient) {
        res.status(404).json({
          message:
            "Could not find any ingredient with name of " + ingredient?.libelle,
        });
      }
      res.status(200).json({
        message:
          "This operation has been achieved with success. You have deleted an item with id" +
          req.params.id +
          ". ",
      });
    } catch (error) {
      res.json(error);
    }
  },

  updateById: async (req, res) => {
    try {
      const { libelle, type, quantity, price } = req.body;
      const ingredient = await Ingredient.findById(req.params.id);
      ingredient.libelle = libelle;
      ingredient.quantity = quantity;
      ingredient.type = type;
      ingredient.price = price;
      if (type === "Supplement" && price == 0) {
        res
          .status(400)
          .json({
            error:
              "Cannot save item with type equal to extra because his price should be not equal to 0 (extra).",
          });
      } else if (type === "Ingredient" && price != 0) {
        res
          .status(400)
          .json({
            error:
              "Cannot save item with type equal to ingredient because his price should be equal to 0 (free).",
          });
      } else {
        const saved = await ingredient.save();
        return res.status(201).json({ data: saved });
      }
      res.json(saved);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  },

  showById: async (req, res) => {
    try {
      // const { libelle, type, quantity, price } = req.body;
      const ingredient = await Ingredient.findById(req.params.id);
      ingredient.disponibility = "Yes";

      const saved = await ingredient.save();
      return res.status(201).json({ data: saved });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  },

  hideById: async (req, res) => {
    try {
      // const { libelle, type, quantity, price } = req.body;
      const ingredient = await Ingredient.findById(req.params.id);
      ingredient.disponibility = "No";

      const saved = await ingredient.save();
      return res.status(201).json({ data: saved });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  },

  diponibleIngredientByProduct : async (req, res) => {
    try {
      const productFK = req.params.productFK;
      await Ingredient.find({disponibility: "Yes",productFK: productFK})
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
    
  retrieveByProducts: async (req, res) => {
    try {
      const productIds = req.body.productIds;
      const ingredients = await Ingredient.find({ productFK: { $in: productIds } });
      res.json(ingredients);
    } catch (error) {
      res.status(500).json({ message: error });
    }
  },

  
};

module.exports = ingredientController;