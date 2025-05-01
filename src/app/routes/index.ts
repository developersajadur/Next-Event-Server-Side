import { Router } from 'express';
import { SSLRoutes } from '../modules/sslcommerz/sslcommerz.route';
import { userRouter } from '../modules/User/user.routes';
import { authRoutes } from '../modules/Auth/Auth.routes';
import { ReviewRouter } from '../modules/Review/review.router';

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
  {
    path: '/payments',
    route: SSLRoutes,
  },
];

moduleRoutes.forEach((item) => router.use(item.path, item.route));

export default router;
