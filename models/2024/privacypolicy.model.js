const mongoose = require('mongoose');

const privacyPolicySchema = new mongoose.Schema({
    pp: {
        title: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true
        }
    },
    informationsCollectees: {
        type: String,
        required: true
    },
        clients: {
            title: {
                type: String,
                required: true
            },
            content: {
                type: String,
                required: true
            }
        },
        equipeRestaurant: {
            title: {
                type: String,
                required: true
            },
            content: {
                type: String,
                required: true
            }
        },
        responsablesFranchise: {
            title: {
                type: String,
                required: true
            },
            content: {
                type: String,
                required: true
            }
        },
    
        utilisationInformations: {
            title: {
                type: String,
                required: true
            },
            content: {
                type: String,
                required: true
            }
        },
    partageInformations: {
        title: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true
        }
    },
    securiteDonnees: {
        title: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true
        }
    },
    vosChoix: {
        title: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true
        }
    },
    modificationsPolitique: {
        title: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true
        }
    },
    nousContacter: {
        title: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true
        }
    },
    accepted: {
        type: Boolean,
        default: false
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});


privacyPolicySchema.methods.getUpdatedAt = function() {
    return this.updatedAt;
};

const PrivacyPolicy = mongoose.model('PrivacyPolicy', privacyPolicySchema);

module.exports = PrivacyPolicy;
