const  WhyChooseUs = require( '../../../models/2024/WhyChooseUs.model.js');
exports.uploadImage = async (req, res) => {
    try {
        // Vérifiez si une image a été téléchargée
        if (!req.file || !req.file.filename) {
            return res.status(400).json({ message: "No image uploaded" });
        }


        const { id } = req.params;

        // Mettre à jour l'élément avec le chemin de l'image
        const updatedItem = await WhyChooseUs.findByIdAndUpdate(id, { image: req.file.filename }, { new: true });

        if (!updatedItem) {
            return res.status(404).json({ message: "Item not found" });
        }

        res.json({ message: "Image updated", updatedItem });
    } catch (err) {
        return res.status(500).json({ message: "Something went wrong: " + err.message });
    }
};
exports.getWhyChooseUs = async (req, res) => {
  try {
    const whyChooseUsData = await WhyChooseUs.find();
    res.json(whyChooseUsData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createWhyChooseUs = async (req, res) => {
    try {
      // Extraire les données du corps de la requête
      const { number, title, description } = req.body;
      
      // Créer une nouvelle instance du modèle avec les données extraites
      const newWhyChooseUs = new WhyChooseUs({ number, title, description });
      
      // Sauvegarder la nouvelle entrée dans la base de données
      const savedWhyChooseUs = await newWhyChooseUs.save();
      
      // Répondre avec les données de la nouvelle entrée créée
      res.status(201).json(savedWhyChooseUs);
    } catch (error) {
      // Gérer les erreurs
      res.status(400).json({ message: error.message });
    }
  };
exports.updateWhyChooseUs = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, image } = req.body;
    const updatedWhyChooseUs = await WhyChooseUs.findByIdAndUpdate(id, { title, description, image }, { new: true });
    res.json(updatedWhyChooseUs);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

 
  exports.getImage = async (req, res) => {
    try {
      const whyChooseUs = await WhyChooseUs.findById(req.params.id);
  
      if (!whyChooseUs || !whyChooseUs.image) {
        return res.status(404).json({ message: 'Image not found' });
      }
  
      // Envoyez le fichier image
      res.sendFile(whyChooseUs.image);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };