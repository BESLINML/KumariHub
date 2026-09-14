const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const cron = require('node-cron');
const Business = require('./models/Business');


dotenv.config();

const app = express();

// Middlewares
app.use(express.json({ limit: '10mb' })); 
app.use(cors());


// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected Successfully!'))
  .catch((err) => console.log('MongoDB Connection Error: ', err));

  cron.schedule('0 0 * * *', async () => {
  try {
    const today = new Date();

    const result = await Business.updateMany(
      { 
        expiryDate: { $lt: today }, 
        status: { $ne: "expired" }
      },
      { 
        $set: { status: "expired" } 
      }
    );

    console.log(`Cron Job: Updated ${result.modifiedCount} businesses to 'expired' status.`);
  } catch (error) {
    console.error("Error in automatic expiry status update cron job:", error);
  }
});

// Routes Import
const businessRoutes = require('./routes/businessRoutes');
app.use('/api/businesses', businessRoutes);

const locationRoutes = require('./routes/locationRoutes');
app.use('/api/locations', locationRoutes);

const categoryRoutes = require('./routes/categoryRoutes');
app.use('/api/categories', categoryRoutes);

const reviewRoutes = require('./routes/reviewRoutes'); 
app.use('/api/reviews', reviewRoutes);

// Test Route
app.get('/', (req, res) => {
  res.send('KumariHub Backend Server is running smoothly!');
});

const dashboardRoutes = require('./routes/dashboardRoutes');
app.use('/api/admin', dashboardRoutes);

const { createOrder } = require('./utils/paymentController');
app.post('/api/create-order', createOrder);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});