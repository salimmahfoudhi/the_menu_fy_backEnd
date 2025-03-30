const _ = require("../models/productimages.model");
const Product = require("../models/product.model");

const ProductImagesController = {
  add: async (req, res) => {
    try {
      const photo_ = req?.file?.filename;
      const productFK = req?.params?.productFK;

      const instance = new _({
        photo_,
        productFK,
      });
      await instance.save();
      return res.status(201).json({ message: "A NEW IMAGE HAS BEEN ADDED" });
    } catch (error) {
      return res.status(501).json({ message: "INTERNAL SERVER ERROR" });
    }
  },

  retrieveByProductFK: async (req, res) => {
    try {
      const productFK = req.params.productFK;

    
      const data = await _.find({ productFK: productFK });

      res.status(200).json(data);
    } catch (error) {
      console.error("Error retrieving data:", error);
      res.status(500).json({ message: "INTERNAL SERVER ERROR" });
    }
  },

  deleteById: async (req, res) => {
    try {
      const id = req?.params?.id;
      await _.findByIdAndDelete(id);
      return res.status(201).json({ message: "AN IMAGE HAS BEEN DELETED" });
    } catch (error) {
      return res.status(501).json({ message: "INTERNAL SERVER ERROR" });
    }
  },
};

module.exports = ProductImagesController;
