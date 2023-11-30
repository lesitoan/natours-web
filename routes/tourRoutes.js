const express = require('express');
const tourController = require('../controlllers/tourController');
const authController = require('../controlllers/authControllser');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

// POST: tours/:tourId/reviews
router.use('/:tourId/reviews', reviewRouter);

router.route('/')
    .post(authController.authMiddleware, authController.restrictTo('admin', 'lead-guide'), tourController.createTour)
    .get(tourController.getAllTours);
router.route('/:id')
    .get(tourController.getTourById)
    .patch(authController.authMiddleware, authController.restrictTo('admin', 'lead-guide'), tourController.updateTourById)
    .delete(authController.authMiddleware, authController.restrictTo('admin', 'lead-guide'), tourController.deleteTourById);
router.route('/get-monthly-plan/:year')
    .get(authController.authMiddleware, authController.restrictTo('admin', 'lead-guide', 'guide'), tourController.getMonthlyPlan);


    
module.exports = router;