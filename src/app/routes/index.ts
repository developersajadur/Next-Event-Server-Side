import { Router } from 'express';
import { ReviewRouter } from '../modules/Review/review.router';

const router = Router();

const moduleRoutes = [
  {
    path: '/review',
    route: ReviewRouter,
  }
];

moduleRoutes.forEach((item) => router.use(item.path, item.route));

export default router;
