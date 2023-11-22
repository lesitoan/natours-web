const express = require('express');
const tourController = require('../controlllers/tourController');

const authController = require('../controlllers/authControllser');

const router = express.Router();

router.route('/')
    .post(tourController.createTour)
    .get(authController.authMiddleware, tourController.getAllTours);
router.route('/:id')
    .get(tourController.getTourById)
    .patch(tourController.updateTourById)
    .delete(authController.authMiddleware, authController.restrictTo('admin', 'lead-guide'), tourController.deleteTourById);
router.route('/get-monthly-plan/:year')
    .get(tourController.getMonthlyPlan);
    
module.exports = router;