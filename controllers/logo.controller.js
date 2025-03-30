const logoModel = require('../models/logo.model');
const baseUrl = 'https://backend.themenufy.com'; 
const path = require('path');
exports.createLogo = async (req, res) => {
    try {
      const { name } = req.body;
      const img = req.file.path; 
      const newLogo = new logoModel({ name, img });
      const savedLogo = await newLogo.save();
      res.status(201).json(savedLogo);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };

exports.getAllLogos = async (req, res) => {
  try {
    const logos = await logoModel.find();
    res.json(logos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateLogo = async (req, res) => {
  try {
    let img;
    if (req.file) {
      img = req.file.path;
    }
    const updatedFields = {};
    if (img) {
      updatedFields.img = img;
    }

    const updatedLogo = await logoModel.findByIdAndUpdate(
      req.params.id,
      updatedFields,
      { new: true }
    );
    res.json(updatedLogo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


exports.archiveLogo = async (req, res) => {
  try {
    const archivedLogo = await logoModel.findByIdAndUpdate(
      req.params.id,
      { archived: true },
      { new: true }
    );
    res.json(archivedLogo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};



exports.getLogoByName = async (req, res) => {
  try {
    const { name } = req.params;
    const logo = await logoModel.findOne({ name });
    if (!logo) {
      return res.status(404).json({ message: 'Logo not found' });
    }
  
    const logoUrl = `${baseUrl}/${logo.img}`; 
    res.status(200).json({ logoUrl }); 
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};