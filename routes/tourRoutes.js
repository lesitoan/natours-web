const express = require('express');
const tourController = require('../controlllers/tourController');

const router = express.Router();

router.route('/')
    .post(tourController.createTour)
    .get(tourController.getAllTours);
router.route('/:id')
    .get(tourController.getTourById)
    .patch(tourController.updateTourById)
    .delete(tourController.deleteTourById);
router.route('/get-monthly-plan/:year')
    .get(tourController.getMonthlyPlan);
    
module.exports = router;