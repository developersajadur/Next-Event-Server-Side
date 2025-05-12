import express from "express"
import { ReviewController } from "./review.controller";
import Auth from "../../middlewares/Auth"

const router = express.Router();

router.get('/:id',
    Auth('USER','ADMIN'), 
 ReviewController.getMyReviews)

router.post('/',
   Auth('USER'),    
ReviewController.createReview)

router.get('/',
   Auth('ADMIN'), 
    ReviewController.getAllReview)
router.patch('/:id',
   Auth('USER'), 
    ReviewController.updateReview)
router.delete('/:id',
    Auth('ADMIN','USER'), 
ReviewController.deleteReview)

router.get('/my-review/:id',
    Auth('ADMIN','USER'), 
    ReviewController.myAllReviews
);

router.get('/events/:id', ReviewController.getReviewsByEvent);

export const ReviewRouter = router;