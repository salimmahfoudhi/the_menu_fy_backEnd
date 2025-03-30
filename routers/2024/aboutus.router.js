// routes/aboutUsRoutes.js
const express = require('express');
const router = express.Router();
const AboutUs = require('../../models/2024/aboutUs.model');

// Route pour récupérer les informations "About Us"
router.get('/about', async (req, res) => {
  try {
    const aboutUsInfo = await AboutUs.findOne();
    res.json(aboutUsInfo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route pour créer de nouvelles informations "About Us"
router.post('/about', async (req, res) => {
  try {
    const newAboutUsInfo = new AboutUs(req.body);
    const savedAboutUsInfo = await newAboutUsInfo.save();
    res.status(201).json(savedAboutUsInfo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Route pour mettre à jour les informations "About Us"
router.put('/about/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const updatedAboutUsInfo = await AboutUs.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updatedAboutUsInfo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
