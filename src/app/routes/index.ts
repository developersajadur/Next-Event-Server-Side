import { Router } from 'express';
import { authRoutes } from '../modules/auth/Auth.routes';
import { userRouter } from '../modules/user/user.routes';
import { SSLRoutes } from '../modules/sslcommerz/sslcommerz.route';

const router = Router();

const moduleRoutes = [
  {
    path: '/user',
    route: userRouter,
  },
  {
    path: '/auth',
    route: authRoutes,
  },
  {
    path: '/payments',
    route: SSLRoutes,
  },
];

moduleRoutes.forEach((item) => router.use(item.path, item.route));

export default router;
