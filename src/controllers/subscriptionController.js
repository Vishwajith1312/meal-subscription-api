const pool = require('../config/db');

// List the logged-in user's subscriptions
async function listMySubscriptions(req, res) {
  try {
    const result = await pool.query(
      `SELECT s.*, mp.name AS plan_name, mp.price AS plan_price
       FROM subscriptions s
       JOIN meal_plans mp ON mp.id = s.plan_id
       WHERE s.user_id = $1
       ORDER BY s.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getSubscription(req, res) {
  try {
    const sub = await pool.query(
      'SELECT * FROM subscriptions WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (sub.rows.length === 0) return res.status(404).json({ error: 'Subscription not found' });

    const deliveries = await pool.query(
      `SELECT d.*, m.name AS meal_name
       FROM deliveries d JOIN meals m ON m.id = d.meal_id
       WHERE d.subscription_id = $1 ORDER BY d.delivery_date`,
      [req.params.id]
    );
    const payments = await pool.query(
      'SELECT * FROM payments WHERE subscription_id = $1 ORDER BY payment_date DESC',
      [req.params.id]
    );

    res.json({ ...sub.rows[0], deliveries: deliveries.rows, payments: payments.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Create a subscription: validates plan + address, creates the subscription,
// generates delivery rows for the plan's meals, and records the payment - in one transaction.
async function createSubscription(req, res) {
  const client = await pool.connect();
  try {
    const { plan_id, address_id, start_date, payment_method } = req.body;
    if (!plan_id || !address_id || !start_date) {
      return res.status(400).json({ error: 'plan_id, address_id and start_date are required' });
    }

    await client.query('BEGIN');

    const plan = await client.query(
      'SELECT * FROM meal_plans WHERE id = $1 AND is_active = TRUE',
      [plan_id]
    );
    if (plan.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Meal plan not found or inactive' });
    }

    const address = await client.query(
      'SELECT id FROM addresses WHERE id = $1 AND user_id = $2',
      [address_id, req.user.id]
    );
    if (address.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Address not found for this user' });
    }

    const subResult = await client.query(
      `INSERT INTO subscriptions (user_id, plan_id, address_id, start_date, status)
       VALUES ($1, $2, $3, $4, 'active') RETURNING *`,
      [req.user.id, plan_id, address_id, start_date]
    );
    const subscription = subResult.rows[0];

    // Generate deliveries for the first week based on plan_meals
    const planMeals = await client.query(
      'SELECT meal_id, day_of_week FROM plan_meals WHERE plan_id = $1',
      [plan_id]
    );
    const dayIndex = {
      Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6,
    };
    for (const pm of planMeals.rows) {
      const offset = dayIndex[pm.day_of_week] ?? 0;
      await client.query(
        `INSERT INTO deliveries (subscription_id, meal_id, delivery_date, status)
         VALUES ($1, $2, $3::date + $4 * INTERVAL '1 day', 'scheduled')`,
        [subscription.id, pm.meal_id, start_date, offset]
      );
    }

    // Record the initial payment for the plan
    const payment = await client.query(
      `INSERT INTO payments (subscription_id, amount, method, status)
       VALUES ($1, $2, $3, 'success') RETURNING *`,
      [subscription.id, plan.rows[0].price, payment_method || 'card']
    );

    await client.query('COMMIT');
    res.status(201).json({ subscription, payment: payment.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
}

async function updateSubscriptionStatus(req, res) {
  try {
    const { status } = req.body;
    const allowed = ['active', 'paused', 'cancelled', 'completed'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: `status must be one of ${allowed.join(', ')}` });
    }
    const result = await pool.query(
      `UPDATE subscriptions SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING *`,
      [status, req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Subscription not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  listMySubscriptions,
  getSubscription,
  createSubscription,
  updateSubscriptionStatus,
};
