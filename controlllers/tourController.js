const { query } = require('express');
const TourModel = require('../models/tourModel');
const ApiFeatures = require('../utils/apiFeatures');


const createTour = async (req, res) => {
    try {
        const tour = req.body;
        const newTour = await TourModel.create(tour);
        return res.status(201).json({
            status: "success",
            data: {
                tour: newTour,
            }
        })
    } catch (err) {
        return res.status(400).json({
            status: 'fail',
            message: err,
        })
    }
}

const getAllTours = async (req, res) => {
    try {
        const feature = new ApiFeatures(TourModel, req.query);
        let getData = feature.filter().sort().paginate().limitFields();
        const tours = await getData.query;
        return res.status(200).json({
            status: "success",
            results: tours.length,
            data: {
                tours,
            }
        })
    } catch (e) {
        return res.status(404).json({
            status: 'fail',
            message: e,
        })
    }
}

const updateTourById = async (req, res) => {
    try {
        const id = req.params.id;
        const newData = req.body
        const tourUpdated = await TourModel.findByIdAndUpdate(
            id,
            newData,
            { new: true, runValidators: true }
        );
        return res.status(200).json({
            status: "success",
            data: {
                tour: tourUpdated,
            }
        })
    } catch (err) {
        return res.status(404).json({
            status: 'fail',
            message: err,
        })
    }
}

const deleteTourById = async (req, res) => {
    try {
        const id = req.params.id;
        await TourModel.findByIdAndRemove(id);
        return res.status(204).json({
            status: "success",
            data: {
                tour: null,
            }
        })
    } catch (err) {
        return res.status(404).json({
            status: 'fail',
            message: err
        })
    }
}

const getMonthlyPlan = async (req, res) => {
    try {
        const plan = await TourModel.aggregate([
            { 
                $unwind: "$startDates"
            },
            { 
                $match : {
                    startDates : {
                        $gte: new Date("2021-01-01"),
                        $lte: new Date("2022-01-01")
                    }
                }
            },
            {
                $group: {
                    _id: { $month : "$startDates" },
                    count: { $sum: 1 },
                    tours: { $push: "$name"}
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
    } catch (err) {
        return res.status(404).json({
            status: 'fail',
            message: err
        })
    }
}


module.exports = {
    getAllTours,
    createTour,
    updateTourById,
    deleteTourById,
    getMonthlyPlan
}