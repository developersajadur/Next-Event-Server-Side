import { Router } from 'express';
import { authRoutes } from '../modules/auth/Auth.routes';
import { eventRoutes } from '../modules/Events/event.routes';
import { SSLRoutes } from '../modules/sslcommerz/sslcommerz.route';
import { userRouter } from '../modules/user/user.routes';

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
  {
    path: '/events',
    route: eventRoutes,
  },
];

moduleRoutes.forEach((item) => router.use(item.path, item.route));

export default router;
