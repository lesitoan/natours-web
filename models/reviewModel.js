const mongoose = require('mongoose');
const TourModel = require('./tourModel');

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

// set 1 user chỉ có thể cmt 1 lần trên 1 tour
reviewSchema.index({tour: 1, user: 1}, {unique: true});

reviewSchema.pre(/^find/, function(next) {
    this.populate({
        path: "user",
        select: "name photo"
    });
    // Chú ý: thêm 1 populate thì sẽ thêm 1 truy vấn, nên thời gian find sẽ tăng lên
    next();
})

// Update "ratingsAverage" và "ratingsQuantity" ở tourSchema
// định nghĩa method trên Model
reviewSchema.statics.calcRatingAverage = async function (tourId) {
    // "this" trong schema.statics sẽ trỏ vào chính Model đó
    const data = await this.aggregate([
        {
            $match: {tour: tourId}
        },
        {
            $group: {
                _id: "$tour",
                numberOfRating: {$sum: 1},
                averageOfRating: {$avg: "$rating"}
            }
        }
    ]);
    await TourModel.findByIdAndUpdate(tourId, {
        ratingsAverage: data[0].averageOfRating,
        ratingsQuantity: data[0].numberOfRating
    });
}
// update tour khi create new review
reviewSchema.post('save', async function() {
    // "this" sẽ trỏ về current document => "this.constructor" sẽ trỏ về Model
    await this.constructor.calcRatingAverage(this.tour);
});

// update tour khi delete hoặc update review
// --------------------------------------------------
reviewSchema.pre(/^findOneAnd/,  async function(next) {
    //vì "this" ở đây là query middleware nên sẽ trả về query, nó khác với "this" ở document middleware ở trên
    // nên ta phải tạo 1 query gián tiếp để có được document
    this.review = await this.findOne(); 
    next();
});
reviewSchema.post(/^findOneAnd/,  async function() {
    await this.review.constructor.calcRatingAverage(this.review.tour);
});
//----------------------------------------------------

const ReviewModel = mongoose.model('Review', reviewSchema);

module.exports = ReviewModel;