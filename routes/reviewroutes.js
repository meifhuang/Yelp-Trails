const express = require('express');
const router = express.Router({mergeParams: true});
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError')
const Trail = require('../models/trail');
const Review = require('../models/review');
const {reviewSchema} = require('../schemas.js');

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(e => e.message).join(',')
        throw new ExpressError(msg, 400);
    }
    else {
        next();
    }
}

router.delete('/:reviewid', catchAsync(async (req, res, next) => {
    const {id, reviewid} = req.params;
    await Trail.findByIdAndUpdate(id, {$pull: {reviews: reviewid}})
    await Review.findByIdAndDelete(reviewid);
    res.redirect(`/trails/${id}`); 
}))

router.post('/', validateReview, catchAsync(async (req, res) => {
    const trail = await Trail.findById(req.params.id);
    const review = new Review(req.body);
    trail.reviews.push(review);
    await review.save();
    await trail.save();
    res.redirect(`/trails/${trail._id}`); 
}))

module.exports = router; 