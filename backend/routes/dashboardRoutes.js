const express = require('express');
const router = express.Router();
const Business = require('../models/Business.js');
const Category = require('../models/Category.js'); 
const Location = require('../models/Location.js'); 

// GET /api/admin/dashboard-stats
router.get('/dashboard-stats', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
      };
    }

    const allBusinesses = await Business.find(dateFilter);

    const totalBusinesses = allBusinesses.length;
    
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const todaysListings = allBusinesses.filter(b => 
      b.createdAt && new Date(b.createdAt) >= startOfDay
    ).length;

    const currentDate = new Date();
    const expiredListings = allBusinesses.filter(b => 
      b.status === 'expired' || (b.expiryDate && new Date(b.expiryDate) < currentDate)
    );

    const inactiveListings = allBusinesses.filter(b => b.status === 'inactive').length;
    
    const categoriesCount = await Category.countDocuments();
    const locationsCount = await Location.countDocuments();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    nextWeek.setHours(23, 59, 59, 999);

    const upcomingRenewals = allBusinesses.filter(b => {
      if (b.status !== 'active' || !b.expiryDate) return false;
      const expDate = new Date(b.expiryDate);
      return expDate >= today && expDate <= nextWeek;
    });

    const premiumList = allBusinesses.filter(b => b.premium === true);
    const nonPremiumList = allBusinesses.filter(b => b.premium !== true);

    const calculatedRevenue = premiumList
      .filter(b => b.status === 'active')
      .reduce((acc, curr) => acc + (curr.price || 500), 0);

    res.json({
      totalBusinesses,
      todaysListings,
      upcomingRenewals,
      expiredListings,
      inactiveListings,
      categories: categoriesCount, 
      locations: locationsCount,   
      revenue: calculatedRevenue,
      premiumList,      
      nonPremiumList    
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;