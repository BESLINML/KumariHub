const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// 1. Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Add new category
router.post('/add', async (req, res) => {
  try {
    const { name, img } = req.body;
    
    const existing = await Category.findOne({ name: new RegExp(`^${name}$`, 'i') });
    if (existing) {
      return res.status(400).json({ message: "Category already exists!" });
    }

    const newCategory = new Category({ name, img });
    await newCategory.save();
    
    res.status(201).json({ message: "Category added successfully!", newCategory });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:name', async (req, res) => {
  try {
    const categoryName = req.params.name;
    const deletedCategory = await Category.findOneAndDelete({ 
      name: new RegExp(`^${categoryName}$`, 'i') 
    });

    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found!" });
    }

    res.status(200).json({ message: "Category deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;