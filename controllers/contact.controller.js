const Contact = require('../models/contact.model');

const ContactController = {
  findAllContacts: async (req, res) => {
    try {
      const contacts = await Contact.find({});
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  createContact: async (req, res) => {
    try {
      const newContact = await Contact.create(req.body);
      res.status(201).json(newContact);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  updateContact: async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const updatedContact = await Contact.findByIdAndUpdate(id, updates, { new: true });
      res.json(updatedContact);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  archiveContact: async (req, res) => {
    try {
      const { id } = req.params;
      await Contact.findByIdAndUpdate(id, { archived: true });
      res.json({ message: 'Contact archived successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  findContactById: async (req, res) => {
    try {
      const { id } = req.params;
      const contact = await Contact.findById(id);
      if (!contact) {
        return res.status(404).json({ message: 'Contact not found' });
      }
      res.json(contact);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  updateContactLocalisation: async (req, res) => {
    try {
      const { id } = req.params;
      const { localisation } = req.body;
  
      const updatedContact = await Contact.findByIdAndUpdate(
        id,
        { localisation },
        { new: true }
      );
      res.json(updatedContact);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = ContactController;