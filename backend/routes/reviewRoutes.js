const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Business = require('../models/Business');

// 1. Add a new review (Using embedded array structure)
router.post('/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;
    const { rating, comment, userName } = req.body;

    if (!rating || !comment || !userName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const updatedReviewDoc = await Review.findOneAndUpdate(
      { businessId: business._id },
      { 
        $push: { 
          businessReview: { 
            userName, 
            rating: Number(rating), 
            comment, 
            createdAt: new Date() 
          } 
        } 
      },
      { returnDocument: 'after', upsert: true }
    );

    const allReviews = (updatedReviewDoc && updatedReviewDoc.businessReview) ? updatedReviewDoc.businessReview : [];
    const totalReviews = allReviews.length;
    const avgRating = totalReviews > 0 
      ? allReviews.reduce((acc, item) => acc + item.rating, 0) / totalReviews 
      : Number(rating);

    const updatedBusiness = await Business.findByIdAndUpdate(
      business._id,
      { avgRating: Number(avgRating.toFixed(1)), reviewCount: totalReviews },
      { returnDocument: 'after' }
    );

    return res.status(201).json({
      message: 'Review added successfully!',
      reviews: allReviews,
      business: updatedBusiness
    });

  } catch (err) {
    console.error('Review POST Error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// 2. Get all reviews for ONE specific business
router.get('/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;

    const reviewDoc = await Review.findOne({ businessId });

    return res.status(200).json({
      reviews: reviewDoc && reviewDoc.businessReview ? reviewDoc.businessReview : []
    });

  } catch (err) {
    console.error('Review GET Error:', err);
    return res.status(500).json({
      error: err.message
    });
  }
});

module.exports = router;