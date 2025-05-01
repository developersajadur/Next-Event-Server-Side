import express from "express"
import { ReviewController } from "./review.controller";

const router = express.Router();

router.post('/', ReviewController.createReview)
router.get('/', ReviewController.getAllReview)
router.delete('/:id', ReviewController.deleteReview)


export const ReviewRouter = router;