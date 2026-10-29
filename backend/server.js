const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cron = require('node-cron');
dotenv.config();

const { pool, initializeDatabase } = require('./db');
const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(cors());

app.use('/api/businesses', require('./routes/businessRoutes'));
app.use('/api/advertisements', require('./routes/advertisementRoutes'));
app.use('/api/locations', require('./routes/locationRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/admin', require('./routes/dashboardRoutes'));
app.post('/api/create-order', require('./utils/paymentController').createOrder);
app.get('/', (_req, res) => res.send('KumariHub Backend Server is running smoothly!'));

cron.schedule('0 0 * * *', async () => {
  try {
    const { rowCount } = await pool.query(
      "UPDATE businesses SET status = 'expired' WHERE \"expiryDate\" < NOW() AND status <> 'expired'"
    );
    console.log(`Cron Job: Updated ${rowCount} businesses to 'expired' status.`);
  } catch (error) {
    console.error('Error in automatic expiry status update cron job:', error);
  }
});

const PORT = process.env.PORT || 5000;
initializeDatabase()
  .then(() => app.listen(PORT, () => console.log(`PostgreSQL connected; server running on port ${PORT}`)))
  .catch((error) => {
    console.error('PostgreSQL initialization failed:', error);
    process.exit(1);
  });
