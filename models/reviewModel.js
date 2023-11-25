const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema({
    review: {
        type: String,
        required: [true, "must have the filed: Review"]
    },
    rating: {
        type: Number,
        required: [true, "must have the filed: Rating"],
        min: 1,
        max: 5,
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: "Tour",
        required: [true, "Review must belong to a Tour"],
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: [true, "Review must belong to a User"],
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
},
    {   //Thêm Options này để dùng được Filed ảo
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

reviewSchema.pre(/^find/, function(next) {
    this.populate({
        path: "user",
        select: "name photo"
    });
    // Chú ý: thêm 1 populate thì sẽ thêm 1 truy vấn, nên thời gian find sẽ tăng lên
    next();
})

const ReviewModel = mongoose.model('Review', reviewSchema);

module.exports = ReviewModel;