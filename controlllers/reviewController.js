const ReviewModel = require('../models/reviewModel');
const handlerFactory = require('./handlerFactory');

const setTourIdAndUserId = (req, res, next) => {
    let {review, rating, user, tour} = req.body; //hạn chế client truyền các data rác khác
    if(!user) user = req.user._id;
    if(!tour) tour = req.params.tourId;
    req.body = { review, rating, user, tour};
    next();
}

const getAllReviews = handlerFactory.getAll(ReviewModel);
const deleteReviewById = handlerFactory.deleteOne(ReviewModel);
const updateReviewById = handlerFactory.updateOne(ReviewModel);
const createReview = handlerFactory.createOne(ReviewModel);


module.exports = {
    createReview,
    getAllReviews, 
    deleteReviewById,
    updateReviewById,
    setTourIdAndUserId
}