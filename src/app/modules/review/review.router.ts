import express from 'express';
import { ReviewController } from '../review/review.controller';
import Auth from '../../middlewares/Auth';

const router = express.Router();

router.get('/my-reviews', Auth('USER'), ReviewController.getMyReviews);

router.post(
  '/',
  Auth('USER'),

  ReviewController.createReview,
);
router.get('/', Auth('ADMIN'), ReviewController.getAllReview);
router.get('/:id', Auth('ADMIN'), ReviewController.getSingleReview);
router.patch('/:id', Auth('USER'), ReviewController.updateReview);
router.delete('/:id', Auth('ADMIN', 'USER'), ReviewController.deleteReview);

router.get('/event/reviews/:eventId', ReviewController.getReviewsByEventId);

export const ReviewRouter = router;