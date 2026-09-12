const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { addReview } = require('../controllers/reviewController');

router.post('/', authenticate, addReview);

module.exports = router;
