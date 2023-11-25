const express = require('express');
const reviewController = require('../controlllers/reviewController');
const authController = require('../controlllers/authControllser');

const router = express.Router({ mergeParams: true });

router.route('/')
    .post(authController.authMiddleware, authController.restrictTo('user'), reviewController.createReview)
    .get(reviewController.getAllReviews);

module.exports = router;