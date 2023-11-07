const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'must have name'],
        unique: true
    },
    duration: {
        type: Number,
        required: [true, 'must have durations']
    },
    maxGroupSize: {
        type: Number,
        required: [true, "must have maxGroupSize"]
    },
    difficulty: {
        type: String,
        required: [true, 'must have diffiulty']
    },

    ratingsAverage: {
        type: Number,
        default: 4.5
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, "must have price"]
    },
    priceDiscount: {
        type: Number,
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'must have summary']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'must have imageCover']
    },
    images: [String],
    createAt: {
        type: Date,
        default: Date.now()
    },
    startDates: [Date]

});

const TourModel = mongoose.model("Tour", tourSchema);

module.exports = TourModel;