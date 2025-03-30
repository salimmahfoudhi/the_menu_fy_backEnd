const socialnet = require('../models/socialnet.model');
const ArchivedCRMSA = require('../models/crmarchivedsa.model');

async function archiveSocialnetChanges(socialnetId, body) {
  try {
    const Socialnet = await socialnet.findById(socialnetId);
    if (!Socialnet) {
      throw new Error('Social network data not found');
    }

    const archivedFields = [];

    for (const key in body) {
      if (body.hasOwnProperty(key) ) {
        if (body[key] !== Socialnet[key]) {
          archivedFields.push({
            field: key,
            value: socialnet[key],
          });
          Socialnet[key] = body[key];
        }
      }
    }

    await Socialnet.save();

    for (const field of archivedFields) {
      const archivedField = new ArchivedCRMSA({
        field: field.field,
        value: field.value,
        Socialnet: Socialnet._id,
      });
      await archivedField.save();
    }
  } catch (error) {
    throw error;
  }
}

module.exports = {
  archiveSocialnetChanges,
};
