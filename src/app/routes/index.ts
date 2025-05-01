import { Router } from 'express';
import { ReviewRouter } from '../modules/Review/review.router';
import { userRouter } from '../modules/User/user.routes';
import { authRoutes } from '../modules/Auth/Auth.routes';

const router = Router();

const moduleRoutes = [

  {  path: '/user',
    route: userRouter,
  },
  {
    path: '/auth',
    route: authRoutes,
  },
  {
    path: '/review',
    route: ReviewRouter,
  },
];

moduleRoutes.forEach((item) => router.use(item.path, item.route));

export default router;
