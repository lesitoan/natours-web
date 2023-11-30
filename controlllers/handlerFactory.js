const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const ApiFeatures = require('../utils/apiFeatures');

const deleteOne = Model => catchAsync(async (req, res, next) => {
    const id = req.params.id;
    const doc = await Model.findByIdAndDelete(id);
    if(!doc) {
        return next(new AppError(`Cant not found document with id ${id}`, 404));
    }
    return res.status(204).json({
        status: "success",
        data: {
            data: null,
        }
    })
});

const updateOne = Model => catchAsync(async (req, res, next) => {
    const id = req.params.id;
    const newData = req.body
    const doc = await Model.findByIdAndUpdate(
        id,
        newData,
        { new: true, runValidators: true }
    );
    if(!doc) {
        return next(new AppError(`Cant not found document with id ${id}`, 404));
    }
    return res.status(200).json({
        status: "success",
        data: {
            data: doc,
        }
    })
});

const createOne = Model => catchAsync(async (req, res, next) => {
    const tour = req.body;
    const newTour = await Model.create(tour);
    return res.status(201).json({
        status: "success",
        data: {
            data: newTour,
        }
    })
});

const getOne = (Model, populateOptions) => catchAsync(async (req, res, next) => {
    const id = req.params.id;
    let query = Model.findById(id);
    if(populateOptions) query = query.populate(populateOptions);

    const doc = await query;
    if(!doc) { 
        return next(new AppError(`Cant not found document with id ${id}`, 404));
    }
    return res.status(200).json({
        status: "success",
        data: {
            data: doc
        }
    })
});

const getAll = Model => catchAsync(async (req, res, next) => {
    // check Review Controller
    let filter = {};
    if(req.params.tourId) filter = { tour: req.params.tourId };

    const feature = new ApiFeatures(Model.find(filter), req.query);
    const getData = feature.filter().sort().paginate().limitFields();
    const docs = await getData.query;
    return res.status(200).json({
        status: "success",
        results: docs.length,
        data: {
            data: docs,
        }
    })
});



module.exports = {
    deleteOne,
    updateOne,
    createOne,
    getOne,
    getAll
}