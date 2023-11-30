const TourModel = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const handlerFactory = require('./handlerFactory');


const getAllTours = handlerFactory.getAll(TourModel);
const getTourById = handlerFactory.getOne(TourModel, {path: 'reviews'});
const updateTourById = handlerFactory.updateOne(TourModel);
const deleteTourById = handlerFactory.deleteOne(TourModel);
const createTour = handlerFactory.createOne(TourModel);


const getMonthlyPlan = catchAsync(async (req, res, next) => {
        const plan = await TourModel.aggregate([
            {
                $unwind: "$startDates"
            },
            {
                $match: {
                    startDates: {
                        $gte: new Date("2021-01-01"),
                        $lte: new Date("2022-01-01")
                    }
                }
            },
            {
                $group: {
                    _id: { $month: "$startDates" },
                    count: { $sum: 1 },
                    tours: { $push: "$name" }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $addFields: { month: "$_id" }
            },
            {
                $project: { _id: 0 }
            }

        ])
        return res.status(200).json({
            status: "success",
            results: plan.length,
            data: {
                plan,
            }
        })
});


module.exports = {
    getAllTours,
    createTour,
    getTourById,
    updateTourById,
    deleteTourById,
    getMonthlyPlan
}