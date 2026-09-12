const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  listPlans, getPlan, createPlan, updatePlan, deletePlan,
} = require('../controllers/planController');

router.get('/', listPlans);
router.get('/:id', getPlan);
router.post('/', authenticate, createPlan);
router.put('/:id', authenticate, updatePlan);
router.delete('/:id', authenticate, deletePlan);

module.exports = router;
