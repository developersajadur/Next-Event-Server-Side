import express from "express"
import { ReviewController } from "./review.controller";
import Auth from "../../middlewares/Auth"

const router = express.Router();

router.get('/:id',
    Auth('USER'), 
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


export const ReviewRouter = router;