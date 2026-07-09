const pool = require('../db');

// GET /api/computers?status=&room=
const getAllComputers = async (req, res) => {
    try {
        const { status = '', room = '' } = req.query;
        const params = [];
        let where = 'WHERE 1=1';

        if (status) {
            params.push(status);
            where += ` AND status = $${params.length}`;
        }
        if (room) {
            params.push(room);
            where += ` AND room = $${params.length}`;
        }

        const { rows } = await pool.query(
            `SELECT * FROM computers ${where} ORDER BY created_at DESC`,
            params
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/computers/:id
const getComputerById = async (req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT * FROM computers WHERE id = $1', [req.params.id]
        );
        if (!rows[0]) return res.status(404).json({ error: 'ไม่พบข้อมูลเครื่องคอมพิวเตอร์นี้' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST /api/computers
const createComputer = async (req, res) => {
    try {
        const { asset_code, brand_model, cpu, ram_gb, room, status } = req.body;

        // Validation
        if (!asset_code || !brand_model || !cpu || !ram_gb || !room || !status) {
            return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วนทุกฟิลด์' });
        }

        const validStatuses = ['ใช้งาน', 'ส่งซ่อม', 'จำหน่าย'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'สถานะต้องเป็น ใช้งาน, ส่งซ่อม หรือ จำหน่าย เท่านั้น' });
        }

        // Check unique asset_code
        const { rows: existing } = await pool.query(
            'SELECT id FROM computers WHERE asset_code = $1', [asset_code.trim()]
        );
        if (existing.length > 0) {
            return res.status(400).json({ error: 'รหัสครุภัณฑ์นี้ถูกใช้งานไปแล้ว' });
        }

        const { rows } = await pool.query(
            `INSERT INTO computers (asset_code, brand_model, cpu, ram_gb, room, status)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [asset_code.trim(), brand_model.trim(), cpu.trim(), parseInt(ram_gb), room.trim(), status.trim()]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// PUT /api/computers/:id
const updateComputer = async (req, res) => {
    try {
        const { asset_code, brand_model, cpu, ram_gb, room, status } = req.body;

        // Validation
        if (!asset_code || !brand_model || !cpu || !ram_gb || !room || !status) {
            return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วนทุกฟิลด์' });
        }

        const validStatuses = ['ใช้งาน', 'ส่งซ่อม', 'จำหน่าย'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'สถานะต้องเป็น ใช้งาน, ส่งซ่อม หรือ จำหน่าย เท่านั้น' });
        }

        // Check unique asset_code for other computers
        const { rows: existing } = await pool.query(
            'SELECT id FROM computers WHERE asset_code = $1 AND id != $2', [asset_code.trim(), req.params.id]
        );
        if (existing.length > 0) {
            return res.status(400).json({ error: 'รหัสครุภัณฑ์นี้ถูกใช้งานโดยเครื่องอื่นแล้ว' });
        }

        const { rows } = await pool.query(
            `UPDATE computers
             SET asset_code=$1, brand_model=$2, cpu=$3, ram_gb=$4, room=$5, status=$6, updated_at=NOW()
             WHERE id=$7 RETURNING *`,
            [asset_code.trim(), brand_model.trim(), cpu.trim(), parseInt(ram_gb), room.trim(), status.trim(), req.params.id]
        );
        if (!rows[0]) return res.status(404).json({ error: 'ไม่พบข้อมูลเครื่องคอมพิวเตอร์นี้' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE /api/computers/:id
const deleteComputer = async (req, res) => {
    try {
        const { rows } = await pool.query(
            'DELETE FROM computers WHERE id=$1 RETURNING *', [req.params.id]
        );
        if (!rows[0]) return res.status(404).json({ error: 'ไม่พบข้อมูลเครื่องคอมพิวเตอร์นี้' });
        res.json({ message: 'ลบข้อมูลเครื่องคอมพิวเตอร์สำเร็จ', deleted: rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getAllComputers,
    getComputerById,
    createComputer,
    updateComputer,
    deleteComputer
};
