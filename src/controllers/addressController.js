const pool = require('../config/db');

async function listAddresses(req, res) {
  try {
    const result = await pool.query(
      'SELECT * FROM addresses WHERE user_id = $1 ORDER BY id',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function addAddress(req, res) {
  try {
    const { line1, city, state, zip_code, is_default } = req.body;
    if (!line1 || !city || !zip_code) {
      return res.status(400).json({ error: 'line1, city and zip_code are required' });
    }

    if (is_default) {
      await pool.query('UPDATE addresses SET is_default = FALSE WHERE user_id = $1', [req.user.id]);
    }

    const result = await pool.query(
      `INSERT INTO addresses (user_id, line1, city, state, zip_code, is_default)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user.id, line1, city, state || null, zip_code, !!is_default]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteAddress(req, res) {
  try {
    const result = await pool.query(
      'DELETE FROM addresses WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Address not found' });
    res.json({ message: 'Address deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { listAddresses, addAddress, deleteAddress };
