// Shelf routes
const express = require('express');
const router = express.Router();
const shelfController = require('../controllers/shelfController');

router.get('/', shelfController.getShelf);

module.exports = router;