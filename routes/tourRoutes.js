const express = require('express');
const tourController = require('../controlllers/tourController');

const router = express.Router();

router.route('/')
    .post(tourController.createTour)
    .get(tourController.getAllTours);
router.route('/:id')
    .patch(tourController.updateTourById)
    .delete(tourController.deleteTourById);
    
module.exports = router;