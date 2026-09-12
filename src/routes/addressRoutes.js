const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { listAddresses, addAddress, deleteAddress } = require('../controllers/addressController');

router.use(authenticate);
router.get('/', listAddresses);
router.post('/', addAddress);
router.delete('/:id', deleteAddress);

module.exports = router;
