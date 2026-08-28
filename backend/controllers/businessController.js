const mongoose = require('mongoose');

exports.getBusinessBySlug = async (req, res) => {
  try {
    const { category, location, name } = req.query;

    const cleanCategory = category ? decodeURIComponent(category).replace(/[-_]/g, ' ').trim() : '';
    const cleanLocation = location ? decodeURIComponent(location).replace(/[-_]/g, ' ').trim() : '';
    const cleanName = name ? decodeURIComponent(name).replace(/[-_]/g, ' ').trim() : '';

    const business = await Business.findOne({
      category: new RegExp(`^${cleanCategory.replace(/\s+/g, '[\\s-]+')}$`, 'i'),
      location: new RegExp(`^${cleanLocation.replace(/\s+/g, '[\\s-]+')}$`, 'i'),
      businessName: new RegExp(`^${cleanName.replace(/\s+/g, '[\\s-]+')}$`, 'i')
    });

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    const reviews = await Review.find({ businessId: new mongoose.Types.ObjectId(business._id) }).sort({ createdAt: -1 });
    
    const related = await Business.find({
      category: business.category,
      _id: { $ne: business._id }
    }).limit(5);

    res.json({ business, reviews, related });
  } catch (err) {
  console.error("========== getBusinessBySlug ERROR ==========");
  console.error("Message:", err.message);
  console.error("Stack:", err.stack);
  console.error("==============================================");

  res.status(500).json({
    message: "Internal Server Error",
    error: err.message,
    stack: err.stack
  });
}}