const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  listMeals, getMeal, createMeal, updateMeal, deleteMeal,
} = require('../controllers/mealController');
const { listReviewsForMeal } = require('../controllers/reviewController');

router.get('/', listMeals);
router.get('/:id', getMeal);
router.get('/:mealId/reviews', listReviewsForMeal);
router.post('/', authenticate, createMeal);
router.put('/:id', authenticate, updateMeal);
router.delete('/:id', authenticate, deleteMeal);

module.exports = router;
