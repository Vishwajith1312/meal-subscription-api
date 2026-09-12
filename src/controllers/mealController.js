const pool = require('../config/db');

async function listMeals(req, res) {
  try {
    const { meal_type } = req.query;
    const params = [];
    let query = 'SELECT * FROM meals';
    if (meal_type) {
      params.push(meal_type);
      query += ' WHERE meal_type = $1';
    }
    query += ' ORDER BY id';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getMeal(req, res) {
  try {
    const meal = await pool.query('SELECT * FROM meals WHERE id = $1', [req.params.id]);
    if (meal.rows.length === 0) return res.status(404).json({ error: 'Meal not found' });

    const reviews = await pool.query(
      `SELECT r.rating, r.comment, r.created_at, u.name AS reviewer
       FROM reviews r JOIN users u ON u.id = r.user_id
       WHERE r.meal_id = $1 ORDER BY r.created_at DESC`,
      [req.params.id]
    );

    res.json({ ...meal.rows[0], reviews: reviews.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function createMeal(req, res) {
  try {
    const { name, description, calories, price, meal_type } = req.body;
    if (!name || !price || !meal_type) {
      return res.status(400).json({ error: 'name, price and meal_type are required' });
    }
    const result = await pool.query(
      `INSERT INTO meals (name, description, calories, price, meal_type)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, description || null, calories || null, price, meal_type]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateMeal(req, res) {
  try {
    const { name, description, calories, price, meal_type } = req.body;
    const result = await pool.query(
      `UPDATE meals SET
         name = COALESCE($1, name),
         description = COALESCE($2, description),
         calories = COALESCE($3, calories),
         price = COALESCE($4, price),
         meal_type = COALESCE($5, meal_type)
       WHERE id = $6 RETURNING *`,
      [name, description, calories, price, meal_type, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Meal not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteMeal(req, res) {
  try {
    const result = await pool.query('DELETE FROM meals WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Meal not found' });
    res.json({ message: 'Meal deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { listMeals, getMeal, createMeal, updateMeal, deleteMeal };
