const TourModel = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const getOverview = catchAsync (async (req, res, next) => {
    const tours = await TourModel.find();
    res.status(200).render('overview', {
        title: "Overview",
        tours
    })
})

const getTour = catchAsync ( async(req, res, next) => {
    // Get tour and guides, reviews
    const tour = await TourModel.findOne({slug: req.params.slug}).populate('reviews');
    
    if(!tour) {
        return next(new AppError('Not tour with slug, please try again !!!', 404));
    };
    res.status(200).render('tour', {
        title: tour.name,
        tour
    })
})

const getLogin = catchAsync ( async(req, res, next) => {
    res.status(200).render('login', {
        title: "Login Natours App"
    })
})

const getAccount = (req, res) => {
    res.status(200).render('account', {
        title: "Your account"
    });
}

module.exports = {
    getOverview,
    getTour,
    getLogin,
    getAccount
}