const pool = require('../config/db');

async function addReview(req, res) {
  try {
    const { meal_id, rating, comment } = req.body;
    if (!meal_id || !rating) {
      return res.status(400).json({ error: 'meal_id and rating are required' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'rating must be between 1 and 5' });
    }

    const result = await pool.query(
      `INSERT INTO reviews (user_id, meal_id, rating, comment)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.user.id, meal_id, rating, comment || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function listReviewsForMeal(req, res) {
  try {
    const result = await pool.query(
      `SELECT r.*, u.name AS reviewer FROM reviews r
       JOIN users u ON u.id = r.user_id
       WHERE r.meal_id = $1 ORDER BY r.created_at DESC`,
      [req.params.mealId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { addReview, listReviewsForMeal };
