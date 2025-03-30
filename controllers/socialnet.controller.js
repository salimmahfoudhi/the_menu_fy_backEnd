const socialnet = require('../models/socialnet.model');
const { archiveSocialnetChanges } = require('../controllers/crmarchivedsa.controller');
const ArchivedCRMSA = require('../models/crmarchivedsa.model');

exports.createSocialnet = async (req, res) => {
  try {
    const newSocialnet = await socialnet.create(req.body);
    res.status(201).json({ success: true, data: newSocialnet });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
exports.getAllSocialnets = async (req, res) => {
  try {
    const socialnets = await socialnet.find();
    res.status(200).json({ success: true, data: socialnets });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateSocialnet = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedFields = { ...req.body };

    const updatedSocialnet = await socialnet.findOneAndUpdate(
      { _id: id }, 
      { $set: updatedFields },
      { new: true } 
    );

    if (!updatedSocialnet) {
      return res.status(404).json({ error: 'Socialnet not found' });
    }

    res.status(200).json({ success: true, data: updatedSocialnet });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};


exports.archiveSocialnet = async (req, res) => {
  try {
    const { id } = req.params;
    const socialnet = await socialnet.findByIdAndUpdate(id, { archived: true }, { new: true });
    res.status(200).json({ success: true, data: socialnet });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Toggle the active status of a socialnet
exports.toggleSocialnet = async (req, res) => {
  try {
    const { id } = req.params;
    const socialnet = await socialnet.findById(id);
    socialnet.active = !socialnet.active;
    await socialnet.save();
    res.status(200).json({ success: true, data: socialnet });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
  const socialnet = require('../models/socialnet.model');
const ArchivedSocialnet = require('../models/archivedsocialnet.model');



};
