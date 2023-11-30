const express = require('express');
const reviewController = require('../controlllers/reviewController');
const authController = require('../controlllers/authControllser');

const router = express.Router({ mergeParams: true });

router.use(authController.authMiddleware);
router.route('/')
    .post(
        authController.restrictTo('user'),
        reviewController.setTourIdAndUserId,
        reviewController.createReview)
    .get(reviewController.getAllReviews);

router.use(authController.restrictTo('user','admin'));
router.route('/:id')
    .delete(reviewController.deleteReviewById)
    .patch(reviewController.updateReviewById);
module.exports = router;