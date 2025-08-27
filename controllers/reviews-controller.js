const reviewsService = require('../service/reviews-service');
const {validationResult} = require('express-validator');
const ApiError = require('../exceptions/api-error');

class ReviewsController{
    async createReview(req, res, next){
        try{
            const errors = validationResult(req);
            if(!errors.isEmpty()){
                return next(ApiError.BadRequest('Validation error', errors.array()))
			      }
            const currentUserId = req.user.id;
            const orderId = req.params.order_id;
            const {comment, speed, quality, communication} = req.body
            const createReview = reviewsService.createReview(comment, speed, quality, communication, orderId, currentUserId);
            return res.json(createReview)
        }catch(e){
            next(e);
        }
    }

    async deleteReview(req, res, next){
        try{
            const errors = validationResult(req);
            if(!errors.isEmpty()){
                return next(ApiError.BadRequest('Validation error', errors.array()))
			      }
            const currentUserId = req.user.id;
            const reviewId = req.params.review_id;
            const deleteReview = reviewsService.deleteReview(reviewId, currentUserId);
            return res.json(deleteReview);
        }catch(e){
            next(e);
        }
    }

    async getAllReviews(req, res, next){
        try{
            const {id, orderId, freelancerId, clientId, sortBy, limit, page} = req.query;
            const reviews = reviewsService.getAllReviews(id, orderId, freelancerId, clientId, sortBy, limit, page);
            return res.json(reviews);
        }catch(e){
            next(e);
        }
    }
}

module.exports = new ReviewsController();