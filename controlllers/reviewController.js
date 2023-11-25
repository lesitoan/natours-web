const ReviewModel = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const createReview = catchAsync( async (req, res, next) => {
    console.log('createReview')
    let {review, rating, user, tour} = req.body; //hạn chế cliend truyền các data rác khác
    if(!user) user = req.user._id;
    if(!tour) tour = req.params.tourId;
    const reviewInput = { review, rating, user, tour};
    const newReview = await ReviewModel.create(reviewInput);
    res.status(201).json({
        status: "success",
        data: {
            review: newReview
        }
    });
});

const getAllReviews = catchAsync( async (req, res, nect) => {
    let filter = {};
    if(req.params.tourId) filter = { tour: req.params.tourId };
    const reviews = await ReviewModel.find(filter);
    res.status(200).json({
        status: "success",
        results: reviews.length,
        data: {
            reviews
        }
    });
});

module.exports = {
    createReview,
    getAllReviews
}