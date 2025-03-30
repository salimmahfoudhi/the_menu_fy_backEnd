const Link = require('../models/link.model');

exports.createLink = async (req, res) => {
  try {
    const link = await Link.create(req.body);
    res.status(201).json({ success: true, data: link });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getAllLinks = async (req, res) => {
  try {
    const links = await Link.find();
    res.status(200).json({ success: true, data: links });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateLink = async (req, res) => {
  try {
    const { id } = req.params;
    const link = await Link.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({ success: true, data: link });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


exports.archiveLink = async (req, res) => {
  try {
    const { id } = req.params;
    const link = await Link.findByIdAndUpdate(id, { archived: true }, { new: true });
    res.status(200).json({ success: true, data: link });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


exports.toggleLink = async (req, res) => {
  try {
    const { id } = req.params;
    const link = await Link.findById(id);
    link.active = !link.active;
    await link.save();
    res.status(200).json({ success: true, data: link });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};



exports.getActiveLinks = async (req, res) => {
  try {
  
    const activeLinks = await Link.find({ active: true });

    
    res.status(200).json(activeLinks);
  } catch (error) {

    console.error('Error fetching active links:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};