const TourModel = require('../models/tourModel');
const ApiFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError')


const createTour = catchAsync(async (req, res, next) => {
    const tour = req.body;
    const newTour = await TourModel.create(tour);
    return res.status(201).json({
        status: "success",
        data: {
            tour: newTour,
        }
    })
});

const getTourById = catchAsync(async (req, res, next) => {
    const id = req.params.id;
    const tour = await TourModel.findById(id).populate('reviews');
    if(!tour) { 
        return next(new AppError(`Cant not found tour with id ${id}`, 404));
    }
    return res.status(200).json({
        status: "success",
        data: {
            tour,
        }
    })
});

const getAllTours = catchAsync(async (req, res, next) => {
        const feature = new ApiFeatures(TourModel.find(), req.query);
        const getData = feature.filter().sort().paginate().limitFields();
        const tours = await getData.query;
        return res.status(200).json({
            status: "success",
            results: tours.length,
            data: {
                tours,
            }
        })
});

const updateTourById = catchAsync(async (req, res, next) => {
        const id = req.params.id;
        const newData = req.body
        const tour = await TourModel.findByIdAndUpdate(
            id,
            newData,
            { new: true, runValidators: true }
        );
        if(!tour) {
            console.log('//////////')
            return next(new AppError(`Cant not found tour with id ${id}`, 404));
        }
        return res.status(200).json({
            status: "success",
            data: {
                tour: tour,
            }
        })
});

const deleteTourById = catchAsync(async (req, res, next) => {
        const id = req.params.id;
        const tour = await TourModel.findByIdAndRemove(id);
        if(!tour) {
            return next(new AppError(`Cant not found tour with id ${id}`, 404));
        }
        return res.status(204).json({
            status: "success",
            data: {
                tour: null,
            }
        })
});

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