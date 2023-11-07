const { query } = require('express');
const TourModel = require('../models/tourModel');

const createTour = async (req, res) => {
    try {
        const tour = req.body;
        console.log(tour);
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
        const queryObj = { ...req.query };
        const excludeFields = ['page', 'sort', 'limit', 'fields'];
        excludeFields.forEach(element => delete queryObj[element]);

        // filler data
        let dataFiller = {};
        if (Object.keys(queryObj).length !== 0) {
            let index;
            dataFiller = JSON.stringify(queryObj)
            .split("")
            .map((el, i) => {
                if (el === '{' && i > 0) index = i + 2;
                if (i === index) el = `$${el}`;
                return el;
            })
            .join('');
            dataFiller = JSON.parse(dataFiller);
        }
        let query = TourModel.find(dataFiller);

        // sort data
        if (req.query.sort) {
            const sortBy = req.query.sort.split(",").join(" ");
            query = query.sort(sortBy);
        }

        const tours = await query;
        return res.status(200).json({
            status: "success",
            results: tours.length,
            data: {
                tours,
            }
        })
    } catch (err) {
        return res.status(404).json({
            status: 'fail',
            message: err,
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
            message: err,
        })
    }

}


module.exports = {
    getAllTours,
    createTour,
    updateTourById,
    deleteTourById
}