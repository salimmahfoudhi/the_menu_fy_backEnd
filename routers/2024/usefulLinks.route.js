// routes/usefulLinks.js

const express = require('express');
const router = express.Router();
const UsefulLink = require('../../models/2024/UsefulLink.model');

// Get all useful links
router.get('/', async (req, res) => {
  try {
    const usefulLinks = await UsefulLink.find();
    res.json(usefulLinks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a new useful link
router.post('/', async (req, res) => {
  const usefulLink = new UsefulLink({
    title: req.body.title,
    url: req.body.url
  });

  try {
    const newUsefulLink = await usefulLink.save();
    res.status(201).json(newUsefulLink);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
