const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cron = require('node-cron');
dotenv.config();

const { pool, initializeDatabase } = require('./db');
const app = express();
app.use(cors());
const paymentController = require('./utils/paymentController');
app.post('/api/razorpay-webhook', express.raw({ type: 'application/json' }), paymentController.handleRazorpayWebhook);
app.use(express.json({ limit: '10mb' }));

app.use('/api/businesses', require('./routes/businessRoutes'));
app.use('/api/advertisements', require('./routes/advertisementRoutes'));
app.use('/api/locations', require('./routes/locationRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/admin', require('./routes/dashboardRoutes'));
app.post('/api/create-order', paymentController.createOrder);
app.post('/api/payment-failed', paymentController.notifyPaymentFailure);
app.get('/', (_req, res) => res.send('KumariHub Backend Server is running smoothly!'));

const cleanExpiredRecords = async () => {
  try {
    const { rowCount: expiredBusinessCount } = await pool.query(
      "UPDATE businesses SET status = 'expired' WHERE \"expiryDate\" < NOW() AND status <> 'expired'"
    );
    const { rowCount: deletedAdvertisementCount } = await pool.query(
      'DELETE FROM advertisements WHERE "expiresAt" <= NOW()'
    );
    if (expiredBusinessCount || deletedAdvertisementCount) {
      console.log(`Expiry cleanup: marked ${expiredBusinessCount} businesses expired and deleted ${deletedAdvertisementCount} advertisements.`);
    }
  } catch (error) {
    console.error('Error in automatic expiry cleanup:', error);
  }
};

// Public queries stop showing ads as soon as they expire; this removes their records too.
cron.schedule('*/15 * * * *', cleanExpiredRecords);

const PORT = process.env.PORT || 5000;
initializeDatabase()
  .then(async () => {
    await cleanExpiredRecords();
    app.listen(PORT, () => console.log(`PostgreSQL connected; server running on port ${PORT}`));
  })
  .catch((error) => {
    console.error('PostgreSQL initialization failed:', error);
    process.exit(1);
  });
