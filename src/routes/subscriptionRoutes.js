const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  listMySubscriptions, getSubscription, createSubscription, updateSubscriptionStatus,
} = require('../controllers/subscriptionController');

router.use(authenticate);
router.get('/', listMySubscriptions);
router.get('/:id', getSubscription);
router.post('/', createSubscription);
router.patch('/:id/status', updateSubscriptionStatus);

module.exports = router;
