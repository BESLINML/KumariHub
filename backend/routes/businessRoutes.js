const express = require('express');
const router = express.Router();
const Business = require('../models/Business');
const Review = require('../models/Review');


router.get('/search/list', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const businesses = await Business.find({
      $or: [
        { businessName: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
        { location: { $regex: q, $options: 'i' } }
      ]
    });

    return res.json(businesses);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/slug', async (req, res) => {
  try {
    const { category, location, name } = req.query;

    if (!category || !location || !name) {
      return res.status(400).json({ message: "Missing required query parameters" });
    }

    const cleanCategory = decodeURIComponent(category).replace(/[-_]/g, ' ').trim();
    const cleanLocation = decodeURIComponent(location).replace(/[-_]/g, ' ').trim();
    const cleanName = decodeURIComponent(name).replace(/[-_]/g, ' ').trim();

    const business = await Business.findOne({
      category: { $regex: new RegExp(`^${cleanCategory}$`, 'i') },
      location: { $regex: new RegExp(`^${cleanLocation}$`, 'i') },
      businessName: { $regex: new RegExp(`^${cleanName}$`, 'i') }
    });

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    const reviewDoc = await Review.findOne({ businessId: business._id });
    const reviews = reviewDoc && reviewDoc.businessReview ? reviewDoc.businessReview : [];

    const related = await Business.find({
      category: business.category,
      _id: { $ne: business._id }
    }).limit(5);

    res.json({ business, reviews, related });

  } catch (err) {
    console.error("Server Error in getBusinessBySlug:", err);
    res.status(500).json({ error: err.message });
  }
});


router.post('/add', async (req, res) => {
  try {
    let businessData = req.body;
    
    if (!businessData.expiryDate) {
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      businessData.expiryDate = oneYearFromNow;
    }

    const newBusiness = new Business(businessData);
    const savedBusiness = await newBusiness.save();
    res.status(201).json(savedBusiness);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


router.post('/reviews', async (req, res) => {
  try {
    const { businessId, rating, comment, userName } = req.body;

    if (!businessId || !rating || !comment || !userName) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newReview = new Review({
      businessId,
      rating,
      comment,
      userName
    });
    await newReview.save();

    const allReviews = await Review.find({ businessId });
    const totalReviews = allReviews.length;
    const avgRating = totalReviews > 0 
      ? Number((allReviews.reduce((acc, item) => acc + item.rating, 0) / totalReviews).toFixed(1))
      : 5;

    const updatedBusiness = await Business.findByIdAndUpdate(
      businessId, 
      { avgRating, reviewCount: totalReviews },
      { returnDocument: 'after' }
    );

    const reviews = await Review.find({ businessId }).sort({ createdAt: -1 });
    const related = await Business.find({
      category: updatedBusiness.category,
      _id: { $ne: businessId }
    }).limit(5);

    res.status(201).json({
      business: updatedBusiness,
      reviews,
      related
    });

  } catch (err) {
    console.error("Error posting review:", err);
    res.status(500).json({ error: err.message });
  }
});



router.get('/category/:categoryName', async (req, res) => {
  try {
    const { categoryName } = req.params;
    const cleanCategory = decodeURIComponent(categoryName).replace(/[-_]/g, ' ').trim();
    
    const businesses = await Business.find({ 
      category: { $regex: new RegExp(`^${cleanCategory}$`, 'i') },
      status: "active"
    });
    res.json(businesses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/location/:locationName', async (req, res) => {
  try {
    const { locationName } = req.params;
    const cleanLocation = decodeURIComponent(locationName).replace(/[-_]/g, ' ').trim();

    const businesses = await Business.find({ 
      location: { $regex: new RegExp(`^${cleanLocation}$`, 'i') },
      status: "active"
    });
    res.json(businesses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:categoryName/:locationName', async (req, res) => {
  try {
    const { categoryName, locationName } = req.params;
    
    const cleanCategory = decodeURIComponent(categoryName).replace(/[-_]/g, ' ').trim();
    const cleanLocation = decodeURIComponent(locationName).replace(/[-_]/g, ' ').trim();

    const businesses = await Business.find({ 
      category: { $regex: new RegExp(`^${cleanCategory}$`, 'i') },
      location: { $regex: new RegExp(`^${cleanLocation}$`, 'i') },
      status: "active"
    });
    res.json(businesses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9; 
    const skip = (page - 1) * limit;

    const query = req.query.all === 'true' ? {} : { status: "active" };

    const businesses = await Business.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Business.countDocuments(query);

    res.json({
      businesses,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + businesses.length < total
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



router.put('/approve/:id', async (req, res) => {
  try {
    const updatedBusiness = await Business.findByIdAndUpdate(
      req.params.id, 
      { status: 'active' }, 
      { returnDocument: 'after' }
    );
    if (!updatedBusiness) return res.status(404).json({ error: "Business not found" });
    res.json(updatedBusiness);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/activate/:id', async (req, res) => {
  try {
    const updatedBusiness = await Business.findByIdAndUpdate(
      req.params.id, 
      { status: 'active' }, 
      { returnDocument: 'after' }
    );
    if (!updatedBusiness) return res.status(404).json({ error: "Business not found" });
    res.json(updatedBusiness);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/inactive/:id', async (req, res) => {
  try {
    const updatedBusiness = await Business.findByIdAndUpdate(
      req.params.id, 
      { status: 'inactive' }, 
      { returnDocument: 'after' }
    );
    if (!updatedBusiness) return res.status(404).json({ error: "Business not found" });
    res.json(updatedBusiness);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updatedBusiness = await Business.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        returnDocument: 'after',
        runValidators: true
      }
    );
    if (!updatedBusiness) return res.status(404).json({ error: "Business not found" });
    res.json(updatedBusiness);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deletedBusiness = await Business.findByIdAndDelete(req.params.id);
    if (!deletedBusiness) return res.status(404).json({ error: "Business not found" });
    res.json({ message: "Business deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



router.get('/:id', async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }
    res.json(business);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;