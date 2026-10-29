require('dotenv').config();
const { pool, initializeDatabase } = require('./db');

const advertisements = [
  {
    companyName: 'Nagercoil Fresh Basket', place: 'Nagercoil', phone: '9000000201', category: 'Grocery',
    coverPhoto: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=80',
    description: 'Fresh vegetables, fruits, and everyday essentials for your home.', durationDays: 30, amount: 499,
  },
  {
    companyName: 'Marthandam Smile Dental Care', place: 'Marthandam', phone: '9000000202', category: 'Healthcare',
    coverPhoto: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=1000&q=80',
    description: 'Friendly dental checkups and family dental care in Marthandam.', durationDays: 15, amount: 299,
  },
  {
    companyName: 'Thuckalay HomeStyle Furnishings', place: 'Thuckalay', phone: '9000000203', category: 'Home & Furniture',
    coverPhoto: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=80',
    description: 'Explore curtains, furnishings, and decor to refresh your home.', durationDays: 30, amount: 499,
  },
  {
    companyName: 'Colachel Coast Cafe', place: 'Colachel', phone: '9000000204', category: 'Restaurant',
    coverPhoto: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80',
    description: 'Enjoy local meals, snacks, and coffee near the Colachel coast.', durationDays: 15, amount: 299,
  },
  {
    companyName: 'Kuzhithurai Tech Point', place: 'Kuzhithurai', phone: '9000000205', category: 'Electronics',
    coverPhoto: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1000&q=80',
    description: 'Computer accessories, laptop support, and everyday tech help.', durationDays: 30, amount: 499,
  },
];

async function seedAdvertisements() {
  await initializeDatabase();
  const client = await pool.connect();
  let inserted = 0;
  try {
    await client.query('BEGIN');
    for (let index = 0; index < advertisements.length; index += 1) {
      const ad = advertisements[index];
      const paymentId = `sample-ad-${index + 1}`;
      const exists = await client.query('SELECT 1 FROM advertisements WHERE "paymentId" = $1 LIMIT 1', [paymentId]);
      if (exists.rowCount) continue;

      await client.query(
        `INSERT INTO advertisements
          ("companyName", place, phone, category, "coverPhoto", description, "durationDays", amount, "paymentId", "expiresAt")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW() + ($7::integer * INTERVAL '1 day'))`,
        [ad.companyName, ad.place, ad.phone, ad.category, ad.coverPhoto, ad.description,
          ad.durationDays, ad.amount, paymentId],
      );
      inserted += 1;
    }
    await client.query('COMMIT');
    console.log(`Seed complete: added ${inserted} of ${advertisements.length} sample advertisements.`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedAdvertisements().catch((error) => {
  console.error('Could not seed sample advertisements:', error.message);
  process.exitCode = 1;
});
