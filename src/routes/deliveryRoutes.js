const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { updateDeliveryStatus, listUpcomingDeliveries } = require('../controllers/deliveryController');

router.use(authenticate);
router.get('/upcoming', listUpcomingDeliveries);
router.patch('/:id/status', updateDeliveryStatus);

module.exports = router;
