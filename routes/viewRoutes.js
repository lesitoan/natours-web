const express = require('express');
const viewController = require('../controlllers/viewController');
const authController = require('../controlllers/authControllser');

const router = express.Router();

router.get('/', authController.isLogedIn, viewController.getOverview);
router.get('/tour/:slug', authController.isLogedIn, viewController.getTour);
router.get('/login', authController.isLogedIn, viewController.getLogin);
router.get('/me', authController.authMiddleware, viewController.getAccount);

module.exports = router;






