const Abonnementfr = require('../models/abonnement.model');
const franchiseModel = require('../models/franchise.model');

exports.createAbonnementfr = async (req, res) => {
  try {
    const newAbonnementfr = await Abonnementfr.create(req.body);
    res.status(201).json({ success: true, data: newAbonnementfr });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getAllAbonnementfrs = async (req, res) => {
  try {
    const abonnementfrs = await Abonnementfr.find();
    res.status(200).json({ success: true, data: abonnementfrs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAbonnementfrById = async (req, res) => {
  try {
    const { id } = req.params;
    const abonnementfr = await Abonnementfr.findById(id);

    if (!abonnementfr) {
      return res.status(404).json({ success: false, error: 'Abonnementfr not found' });
    }

    res.status(200).json({ success: true, data: abonnementfr });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateAbonnementfr = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedFields = { ...req.body };

    const updatedAbonnementfr = await Abonnementfr.findByIdAndUpdate(
      id,
      { $set: updatedFields },
      { new: true }
    );

    if (!updatedAbonnementfr) {
      return res.status(404).json({ success: false, error: 'Abonnementfr not found' });
    }

    res.status(200).json({ success: true, data: updatedAbonnementfr });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

exports.deleteAbonnementfr = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAbonnementfr = await Abonnementfr.findByIdAndDelete(id);

    if (!deletedAbonnementfr) {
      return res.status(404).json({ success: false, error: 'Abonnementfr not found' });
    }

    res.status(200).json({ success: true, data: deletedAbonnementfr });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.archiveAbonnementfr = async (req, res) => {
  try {
    const { id } = req.params;
    const abonnementfr = await Abonnementfr.findByIdAndUpdate(id, { archived: true }, { new: true });
    res.status(200).json({ success: true, data: abonnementfr });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.toggleAbonnementfr = async (req, res) => {
  try {
    const { id } = req.params;
    const abonnementfr = await Abonnementfr.findById(id);
    abonnementfr.active = !abonnementfr.active;
    await abonnementfr.save();
    res.status(200).json({ success: true, data: abonnementfr });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAvailableAbonnements = async (req, res) => {
  try {
    const { franchiseId } = req.params;
  
    const franchise = await franchiseModel.findById(franchiseId);
    const nbrF = franchise.nbrF;
  
    const availableAbonnements = await Abonnementfr.find({ maxRestaurants: { $gt: nbrF } });
  
    res.status(200).json({ success: true, data: availableAbonnements });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

exports.assignAbonnement = async (req, res) => {
  const { franchiseId, abonnementId } = req.params; 
  
  try {
    const franchise = await franchiseModel.findById(franchiseId);
    const abonnement = await Abonnementfr.findById(abonnementId);
  
    if (!franchise) {
      return res.status(404).json({ success: false, error: 'Franchise not found' });
    }
  
    if (!abonnement) {
      return res.status(404).json({ success: false, error: 'Abonnement not found' });
    } 
  
    franchise.abonnement = abonnement._id;
    franchise.nbrF = abonnement.maxRestaurants;
    franchise.startDate = new Date(); 
    const lastDate = new Date();
    lastDate.setFullYear(lastDate.getFullYear() + 1); 
    franchise.lastDate = lastDate;

    await franchise.save();
  
    res.status(200).json({ success: true, data: franchise });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};


exports.getFranchiseDetails = async (req, res) => {
  const { franchiseId } = req.params; 
  
  try {
    const franchise = await franchiseModel.findById(franchiseId).populate('abonnement');
  
    if (!franchise) {
      return res.status(404).json({ success: false, error: 'Franchise not found' });
    }
  
    res.status(200).json({ success: true, data: franchise });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};
const calculateProratedRefund = (price, elapsedMonths) => {
  // Calculate the monthly rate
  const monthlyRate = price / 12;

  // Calculate the used amount
  const usedAmount = elapsedMonths * monthlyRate;

  // Calculate the remaining amount
  const remainingAmount = price - usedAmount;

  return remainingAmount > 0 ? remainingAmount : 0;
};
const calculateAdjustedCost = (newPrice, oldPrice, elapsedMonths, totalMonths) => {
  // Calculate monthly costs
  const newMonthlyCost = newPrice / 12;
  const oldMonthlyCost = oldPrice / 12;

  const remainingMonths = totalMonths - elapsedMonths;

  const newSubscriptionCost = newMonthlyCost * remainingMonths;

  const oldSubscriptionCost = oldMonthlyCost * remainingMonths;

  console.log(`New Price: ${newPrice}`);
  console.log(`Old Price: ${oldPrice}`);
  console.log(`Elapsed Months: ${elapsedMonths}`);
  console.log(`Total Months: ${totalMonths}`);
  console.log(`Remaining Months: ${remainingMonths}`);
  console.log(`New Subscription Cost: ${newSubscriptionCost}`);
  console.log(`Old Subscription Cost: ${oldSubscriptionCost}`);

  const adjustedCost = (newSubscriptionCost - oldSubscriptionCost)*elapsedMonths;

  return adjustedCost > 0 ? adjustedCost : 0;
};

// Example Usage
const newPrice = 2600.99;
const oldPrice = 2500.99;
const elapsedMonths = 12;
const totalMonths = 13;

const adjustedCost = calculateAdjustedCost(newPrice, oldPrice, elapsedMonths, totalMonths);
console.log(`Adjusted Cost: ${adjustedCost}`);

const getElapsedMonths = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
};

exports.getUpgradeOptions = async (req, res) => {
  const { franchiseId } = req.params;

  try {
    const franchise = await franchiseModel.findById(franchiseId).populate('abonnement');
    
    if (!franchise) {
      return res.status(404).json({ success: false, error: 'Franchise not found' });
    }

    const currentAbonnement = franchise.abonnement;
    let proratedRefund = 0;
    let elapsedMonths = 0;
    let totalMonths = 12; 

    if (currentAbonnement && franchise.startDate && franchise.lastDate) {
      const startDate = new Date(franchise.startDate);
      const lastDate = new Date(franchise.lastDate);

      
      elapsedMonths = getElapsedMonths(startDate, lastDate);

      totalMonths = (lastDate.getFullYear() - startDate.getFullYear()) * 12 + (lastDate.getMonth() - startDate.getMonth()) + 1;

      proratedRefund = calculateProratedRefund(currentAbonnement.price, elapsedMonths);
    }

    const availableAbonnements = await Abonnementfr.find({ price: { $gt: currentAbonnement.price } });

    const upgradeOptions = availableAbonnements.map(plan => {
      const adjustedCost = calculateAdjustedCost(plan.price, currentAbonnement.price, elapsedMonths, totalMonths);
      
      return {
        ...plan._doc,
        adjustedCost: adjustedCost > 0 ? adjustedCost : 0,
        proratedRefund,  
        elapsedMonths   
      };
    });

    res.status(200).json({ success: true, data: upgradeOptions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};
