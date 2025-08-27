const reviewsModel = require('../models/reviews-model');
const OrderModel = require('../models/order-model');
const OrderRespondService = require('../service/order-respond-service');
const UserService = require('../service/user-service');
const ReviewsDto = require('../dtos/reviews-dto');
const ApiError = require('../exceptions/api-error');

class ReviewsService{
    async createReview(comment, speed, quality, communication, orderId, currentUserId){
        const order = await OrderModel.getOrderInfo(orderId);
		if (!order || order.o_client_id !== currentUserId || order.o_status !== 'completed') {
			throw ApiError.BadRequest('You cannot create review for this order');
		}
        const respondInfo = await OrderRespondService.getRespondByOrderId(orderId);
        const createReview = await reviewsModel.createReview(comment, speed, quality, communication, orderId, currentUserId, respondInfo.or_freelancer_id);
        const rating = await reviewsModel.getUserRating(respondInfo.or_freelancer_id);
        await UserService.updateUserRating(rating.avg_rating, respondInfo.or_freelancer_id);
        const reviewsDto = new ReviewsDto(createReview);
        return {review: reviewsDto};
    }

    async getAllReviews(id, orderId, freelancerId, clientId, sortBy, limit, page){
        const reviews = await reviewsModel.getAllReviews(id, orderId, freelancerId, clientId, sortBy, limit, page);
        const reviewsDto = new ReviewsDto(reviews);
        return {reviews: reviewsDto};
    }

    async deleteReview(reviewId, currentUserId){
        const review = await reviewsModel.getReviewById(reviewId);
        if (!review || review.r_client_id !== currentUserId){
            throw ApiError.BadRequest('You cannot delete this review');
        }
        const freelancer_id = review.or_freelancer_id
        const deleteReview = await reviewsModel.deleteReview(reviewId);
        const rating = await reviewsModel.getUserRating(freelancer_id);
        await UserService.updateUserRating(rating.avg_rating, freelancer_id);
        return deleteReview;
    }

}

module.exports = new ReviewsService();