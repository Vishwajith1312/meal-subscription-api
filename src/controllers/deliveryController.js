const pool = require('../config/db');

// Update a delivery's status (delivered / skipped / failed) - owner only
async function updateDeliveryStatus(req, res) {
  try {
    const { status } = req.body;
    const allowed = ['scheduled', 'delivered', 'skipped', 'failed'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: `status must be one of ${allowed.join(', ')}` });
    }

    const result = await pool.query(
      `UPDATE deliveries d SET status = $1
       FROM subscriptions s
       WHERE d.id = $2 AND d.subscription_id = s.id AND s.user_id = $3
       RETURNING d.*`,
      [status, req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Delivery not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function listUpcomingDeliveries(req, res) {
  try {
    const result = await pool.query(
      `SELECT d.*, m.name AS meal_name, s.id AS subscription_id
       FROM deliveries d
       JOIN subscriptions s ON s.id = d.subscription_id
       JOIN meals m ON m.id = d.meal_id
       WHERE s.user_id = $1 AND d.delivery_date >= CURRENT_DATE
       ORDER BY d.delivery_date`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { updateDeliveryStatus, listUpcomingDeliveries };
