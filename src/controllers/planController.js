const pool = require('../config/db');

async function listPlans(req, res) {
  try {
    const result = await pool.query(
      'SELECT * FROM meal_plans WHERE is_active = TRUE ORDER BY id'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getPlan(req, res) {
  try {
    const plan = await pool.query('SELECT * FROM meal_plans WHERE id = $1', [req.params.id]);
    if (plan.rows.length === 0) return res.status(404).json({ error: 'Plan not found' });

    const meals = await pool.query(
      `SELECT m.id, m.name, m.meal_type, pm.day_of_week
       FROM plan_meals pm
       JOIN meals m ON m.id = pm.meal_id
       WHERE pm.plan_id = $1
       ORDER BY pm.day_of_week`,
      [req.params.id]
    );

    res.json({ ...plan.rows[0], meals: meals.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function createPlan(req, res) {
  try {
    const { name, description, price, meals_per_week, category } = req.body;
    if (!name || !price || !meals_per_week || !category) {
      return res.status(400).json({ error: 'name, price, meals_per_week, category are required' });
    }
    const result = await pool.query(
      `INSERT INTO meal_plans (name, description, price, meals_per_week, category)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, description || null, price, meals_per_week, category]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updatePlan(req, res) {
  try {
    const { name, description, price, meals_per_week, category, is_active } = req.body;
    const result = await pool.query(
      `UPDATE meal_plans SET
         name = COALESCE($1, name),
         description = COALESCE($2, description),
         price = COALESCE($3, price),
         meals_per_week = COALESCE($4, meals_per_week),
         category = COALESCE($5, category),
         is_active = COALESCE($6, is_active)
       WHERE id = $7 RETURNING *`,
      [name, description, price, meals_per_week, category, is_active, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Plan not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deletePlan(req, res) {
  try {
    const result = await pool.query(
      'UPDATE meal_plans SET is_active = FALSE WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Plan not found' });
    res.json({ message: 'Plan deactivated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { listPlans, getPlan, createPlan, updatePlan, deletePlan };
