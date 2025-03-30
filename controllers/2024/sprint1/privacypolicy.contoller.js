// controllers/PrivacyPolicyController.js
const PrivacyPolicy = require('../../../models/2024/privacypolicy.model');




exports.getPrivacyPolicy = async (req, res) => {
    try {
        const privacyPolicy = await PrivacyPolicy.findOne();
        if (!privacyPolicy) {
            return res.status(404).json({ message: "Politique de confidentialité introuvable." });
        }
        const policyData = {
            _id: privacyPolicy._id,
            pp: {
                title: privacyPolicy.pp.title,
                content: privacyPolicy.pp.content
            },
            informationsCollectees: privacyPolicy.informationsCollectees,
            clients: {
                title: privacyPolicy.clients.title,
                content: privacyPolicy.clients.content
            },
            equipeRestaurant: {
                title: privacyPolicy.equipeRestaurant.title,
                content: privacyPolicy.equipeRestaurant.content
            },
            responsablesFranchise: {
                title: privacyPolicy.responsablesFranchise.title,
                content: privacyPolicy.responsablesFranchise.content
            },
            utilisationInformations: {
                title: privacyPolicy.utilisationInformations.title,
                content: privacyPolicy.utilisationInformations.content,
            },
            partageInformations: {
                title: privacyPolicy.partageInformations.title,
                content: privacyPolicy.partageInformations.content
            },
            securiteDonnees: {
                title: privacyPolicy.securiteDonnees.title,
                content: privacyPolicy.securiteDonnees.content
            },
            vosChoix: {
                title: privacyPolicy.vosChoix.title,
                content: privacyPolicy.vosChoix.content
            },
            modificationsPolitique: {
                title: privacyPolicy.modificationsPolitique.title,
                content: privacyPolicy.modificationsPolitique.content
            },
            nousContacter: {
                title: privacyPolicy.nousContacter.title,
                content: privacyPolicy.nousContacter.content
            },
            updatedAt: privacyPolicy.getUpdatedAt() 
        };
        res.json(policyData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.acceptPrivacyPolicy = async (req, res) => {
    try {
        const privacyPolicy = await PrivacyPolicy.findOne();
        if (!privacyPolicy) {
            return res.status(404).json({ message: "Privacy policy not found." });
        }
        privacyPolicy.accepted = true;
        await privacyPolicy.save();
        res.json({ message: 'Privacy policy accepted successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.createPrivacyPolicy = async (req, res) => {
    try {
        const { pp, informationsCollectees, clients, equipeRestaurant, responsablesFranchise, utilisationInformations, partageInformations, securiteDonnees, vosChoix, modificationsPolitique, nousContacter, accepted } = req.body;
        const privacyPolicy = new PrivacyPolicy({
            pp,
            informationsCollectees,
            clients,
            equipeRestaurant,
            responsablesFranchise,
            utilisationInformations,
            partageInformations,
            securiteDonnees,
            vosChoix,
            modificationsPolitique,
            nousContacter,
            accepted,
            updatedAt: Date.now() 
        });
        const savedPolicy = await privacyPolicy.save();
        res.json(savedPolicy);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// controllers/PrivacyPolicyController.js


// controllers/privacyPolicyController.js

exports.updatePrivacyPolicy = async (req, res) => {
    try {
        const { id } = req.params;
        const updateObj = {};
        
        // Iterate over the fields in the request body
        Object.keys(req.body).forEach(field => {
            // Check if the field is not an object (nested field)
            if (typeof req.body[field] !== 'object') {
                // Update the field in the update object
                updateObj[field] = req.body[field];
            } else {
                // If the field is an object, update its nested fields separately
                Object.keys(req.body[field]).forEach(subField => {
                    // Update the nested field in the update object
                    updateObj[`${field}.${subField}`] = req.body[field][subField];
                });
            }
        });

        // Add updatedAt field to the update object
        updateObj.updatedAt = Date.now();

        // Perform the update operation
        const updatedPolicy = await PrivacyPolicy.findByIdAndUpdate(
            id,
            updateObj,
            { new: true }
        );
        
        if (!updatedPolicy) {
            return res.status(404).json({ message: "Politique de confidentialité non trouvée" });
        }
        
        res.json(updatedPolicy);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
