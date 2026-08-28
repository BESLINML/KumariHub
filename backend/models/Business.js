const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  ownerName: { type: String, required: true }, 
  businessName: { type: String, required: true },
  category: { type: String, required: true },
  address: { type: String, required: true },
  location: { type: String, required: true },
  phone: { type: String, required: true },       
  whatsapp: { type: String, required: true },                     
  services: { type: [String] , required: true},                  
  aboutBusness: { type: String, required: true },
  img: { type: String , required: true},
  timing: { type: Object , required: true},
  locationLink: { type: String },
  status: { type: String, default: "active" },
  premium: { type: Boolean, default: false },
  avgRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  expiryDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Helper function to format numbers
const formatNum = (num) => {
  if (!num) return '';
  let cleaned = String(num).replace(/\D/g, ''); 
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned; 
  }
  return cleaned;
};

businessSchema.pre('save', function() {
  if (this.phone) this.phone = formatNum(this.phone);
  if (this.whatsapp) this.whatsapp = formatNum(this.whatsapp);
});

businessSchema.pre('findOneAndUpdate', function() {
  const update = this.getUpdate();
  if (update) {
    if (update.phone) update.phone = formatNum(update.phone);
    if (update.whatsapp) update.whatsapp = formatNum(update.whatsapp);
    
    if (update.$set) {
      if (update.$set.phone) update.$set.phone = formatNum(update.$set.phone);
      if (update.$set.whatsapp) update.$set.whatsapp = formatNum(update.$set.whatsapp);
    }
  }
});

businessSchema.index({ category: 1, location: 1 });
module.exports = mongoose.model('Business', businessSchema);
