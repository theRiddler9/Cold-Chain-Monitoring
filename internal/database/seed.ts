import { pool } from './client.js';

export async function runSeed() {
  if (!pool) return;

  // Organizations & Sites
  await pool.query(`INSERT INTO organizations (id, name) VALUES ('org_1', 'Global Pharma') ON CONFLICT DO NOTHING`);
  await pool.query(`INSERT INTO sites (id, org_id, name, type) VALUES ('site_1', 'org_1', 'Nairobi Depot', 'WAREHOUSE') ON CONFLICT DO NOTHING`);

  // Products & Batches
  await pool.query(`
    INSERT INTO products (id, name, target_min_c, target_max_c, freeze_sensitive, stability_budget_mins) 
    VALUES ('prod_1', 'Measles Vaccine', 2, 8, true, 120) 
    ON CONFLICT DO NOTHING
  `);
  await pool.query(`
    INSERT INTO batches (id, product_id, lot, expiry) 
    VALUES ('batch_1', 'prod_1', 'LOT-999', '2027-01-01') 
    ON CONFLICT DO NOTHING
  `);

  // Logistics
  await pool.query(`
    INSERT INTO shipments (id, batch_id, status) 
    VALUES ('ship_1', 'batch_1', 'IN_TRANSIT') 
    ON CONFLICT DO NOTHING
  `);

  // Hardware
  await pool.query(`INSERT INTO units (id, name, type) VALUES ('unit_1', 'Truck 42', 'TRUCK') ON CONFLICT DO NOTHING`);
  await pool.query(`INSERT INTO devices (id, type, mac_address) VALUES ('dev_1', 'HUB', 'AA:BB:CC:DD:EE:FF') ON CONFLICT DO NOTHING`);
  
  // Assignment
  await pool.query(`
    INSERT INTO device_assignments (id, device_id, unit_id, shipment_id, active) 
    VALUES ('assign_1', 'dev_1', 'unit_1', 'ship_1', true) 
    ON CONFLICT DO NOTHING
  `);
}
