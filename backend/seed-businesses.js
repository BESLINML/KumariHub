const dotenv = require('dotenv');
dotenv.config();

const { pool, initializeDatabase } = require('./db');

const locations = [
  'Nagercoil', 'Marthandam', 'Kuzhithurai', 'Thuckalay', 'Colachel',
  'Kaliyakkavilai', 'Kulasekharam', 'Eraniel', 'Monday Market', 'Thingal Nagar',
];

const businesses = [
  { ownerName: 'Demo Owner', businessName: 'Coconut Grove Cafe', category: 'Restaurant', location: 'Nagercoil', address: 'Court Road, Nagercoil', phone: '9000000101', services: ['South Indian meals', 'Coffee', 'Takeaway'], aboutBusness: 'A sample cafe serving local meals, snacks, and freshly brewed coffee.', img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80' },
  { ownerName: 'Demo Owner', businessName: 'Marthandam Family Dental', category: 'Healthcare', location: 'Marthandam', address: 'Main Road, Marthandam', phone: '9000000102', services: ['Dental checkups', 'Cleaning', 'Restorative care'], aboutBusness: 'A sample family dental clinic offering routine and restorative care.', img: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=1000&q=80' },
  { ownerName: 'Demo Owner', businessName: 'Kuzhithurai Cycle Works', category: 'Automotive', location: 'Kuzhithurai', address: 'Railway Station Road, Kuzhithurai', phone: '9000000103', services: ['Cycle repair', 'Spare parts', 'Tune-ups'], aboutBusness: 'A sample neighborhood shop for bicycle repairs and accessories.', img: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1000&q=80' },
  { ownerName: 'Demo Owner', businessName: 'Thuckalay Home Appliances', category: 'Electronics', location: 'Thuckalay', address: 'Market Road, Thuckalay', phone: '9000000104', services: ['Appliance sales', 'Installation', 'Repairs'], aboutBusness: 'A sample appliance store with installation and repair services.', img: 'https://images.unsplash.com/photo-1558008258-3256797b43f3?auto=format&fit=crop&w=1000&q=80' },
  { ownerName: 'Demo Owner', businessName: 'Colachel Seaside Bakery', category: 'Bakery', location: 'Colachel', address: 'Harbour Road, Colachel', phone: '9000000105', services: ['Fresh bread', 'Cakes', 'Tea snacks'], aboutBusness: 'A sample bakery making fresh bread, cakes, and local tea-time snacks.', img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=80' },
  { ownerName: 'Demo Owner', businessName: 'Kaliyakkavilai Print Point', category: 'Printing', location: 'Kaliyakkavilai', address: 'Bus Stand Road, Kaliyakkavilai', phone: '9000000106', services: ['Digital printing', 'Lamination', 'Photocopies'], aboutBusness: 'A sample print shop for everyday document and photo services.', img: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&w=1000&q=80' },
  { ownerName: 'Demo Owner', businessName: 'Kulasekharam Garden Care', category: 'Home Services', location: 'Kulasekharam', address: 'Market Junction, Kulasekharam', phone: '9000000107', services: ['Garden maintenance', 'Plant supply', 'Landscaping'], aboutBusness: 'A sample gardening service for home gardens and small outdoor spaces.', img: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1000&q=80' },
  { ownerName: 'Demo Owner', businessName: 'Eraniel Tailoring Studio', category: 'Clothing', location: 'Eraniel', address: 'Palace Road, Eraniel', phone: '9000000108', services: ['Alterations', 'Custom stitching', 'Blouse stitching'], aboutBusness: 'A sample tailoring studio offering alterations and custom stitching.', img: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&w=1000&q=80' },
  { ownerName: 'Demo Owner', businessName: 'Monday Market Fresh Mart', category: 'Grocery', location: 'Monday Market', address: 'Market Street, Monday Market', phone: '9000000109', services: ['Fresh produce', 'Household essentials', 'Local delivery'], aboutBusness: 'A sample neighborhood grocery with fresh produce and household essentials.', img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=80' },
  { ownerName: 'Demo Owner', businessName: 'Thingal Nagar Laptop Care', category: 'Electronics', location: 'Thingal Nagar', address: 'Main Bazaar, Thingal Nagar', phone: '9000000110', services: ['Laptop diagnostics', 'Software support', 'Computer accessories'], aboutBusness: 'A sample computer service shop for laptop support and accessories.', img: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1000&q=80' },
];

async function seed() {
  await initializeDatabase();
  const client = await pool.connect();
  let inserted = 0;
  try {
    await client.query('BEGIN');
    for (const locationName of locations) {
      await client.query(
        'INSERT INTO locations ("locationName") VALUES ($1) ON CONFLICT ("locationName") DO NOTHING',
        [locationName],
      );
    }

    for (const business of businesses) {
      const exists = await client.query(
        'SELECT 1 FROM businesses WHERE "businessName" = $1 AND location = $2 LIMIT 1',
        [business.businessName, business.location],
      );
      if (exists.rowCount) continue;

      await client.query(
        `INSERT INTO businesses
          ("ownerName", "businessName", category, address, location, phone, whatsapp,
           services, "aboutBusness", img, timing, status, premium, "expiryDate")
         VALUES ($1, $2, $3, $4, $5, $6, $6, $7::jsonb, $8, $9, $10::jsonb, 'active', FALSE, NOW() + INTERVAL '1 year')`,
        [business.ownerName, business.businessName, business.category, business.address,
          business.location, business.phone, JSON.stringify(business.services),
          business.aboutBusness, business.img,
          JSON.stringify({ Monday: '9:00 AM - 6:00 PM', Tuesday: '9:00 AM - 6:00 PM', Wednesday: '9:00 AM - 6:00 PM', Thursday: '9:00 AM - 6:00 PM', Friday: '9:00 AM - 6:00 PM', Saturday: '9:00 AM - 2:00 PM', Sunday: 'Closed' })],
      );
      inserted += 1;
    }

    await client.query('COMMIT');
    console.log(`Seed complete: added ${inserted} of ${businesses.length} sample listings.`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((error) => {
  console.error('Could not seed sample listings:', error.message);
  process.exitCode = 1;
});
