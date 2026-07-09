require('dotenv').config();
const pool = require('./src/db');
const app = require('./src/app');

const PORT = process.env.PORT || 3001;

async function initDb() {
    // สร้าง table computers ถ้ายังไม่มี
    await pool.query(`
    CREATE TABLE IF NOT EXISTS computers (
      id          SERIAL PRIMARY KEY,
      asset_code  VARCHAR(100) NOT NULL UNIQUE,
      brand_model VARCHAR(200) NOT NULL,
      cpu         VARCHAR(100) NOT NULL,
      ram_gb      INTEGER NOT NULL,
      room        VARCHAR(50) NOT NULL,
      status      VARCHAR(50) NOT NULL,
      created_at  TIMESTAMPTZ DEFAULT NOW(),
      updated_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `);
    console.log('✅ Table computers ready');

    // ใส่ Seed data ถ้า table ว่าง
    const { rows } = await pool.query('SELECT COUNT(*) FROM computers');
    if (parseInt(rows[0].count) === 0) {
        await pool.query(`
      INSERT INTO computers (asset_code, brand_model, cpu, ram_gb, room, status) VALUES
      ('COM-01-001', 'Acer Veriton M200', 'Intel Core i5-12400', 16, 'Lab 501', 'ใช้งาน'),
      ('COM-01-002', 'HP ProDesk 400 G7', 'Intel Core i7-10700', 8,  'Lab 501', 'ส่งซ่อม'),
      ('COM-01-003', 'Dell OptiPlex 3080', 'Intel Core i5-10500', 16, 'Lab 502', 'ใช้งาน'),
      ('COM-01-004', 'Lenovo ThinkCentre M70s', 'AMD Ryzen 5 4600G', 8, 'Lab 503', 'จำหน่าย')
    `);
        console.log('🌱 Seed data inserted (4 computers)');
    }
}

initDb()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`🚀 Computer Room Management API running at http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('❌ DB init failed:', err.message);
        process.exit(1);
    });
