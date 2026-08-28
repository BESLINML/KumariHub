const express = require('express');
const router = express.Router();
const Location = require('../models/Location');

// 1. Get all locations (GET request)
router.get('/', async (req, res) => {
  try {
    const locations = await Location.find().sort({ createdAt: -1 });
    res.status(200).json(locations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Add new location (POST request)
router.post('/add', async (req, res) => {
  try {
    const { locationName } = req.body;
    
    
    const existing = await Location.findOne({ locationName: new RegExp(`^${locationName}$`, 'i') });
    if (existing) {
      return res.status(400).json({ message: "Location already exists!" });
    }

    const newLocation = new Location({ locationName });
    await newLocation.save();
    
    res.status(201).json({ message: "Location added successfully!", newLocation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;