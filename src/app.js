const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const planRoutes = require('./routes/planRoutes');
const mealRoutes = require('./routes/mealRoutes');
const addressRoutes = require('./routes/addressRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/reviews', reviewRoutes);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// Basic error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
