import { Router } from 'express';
import { SSLRoutes } from '../modules/sslcommerz/sslcommerz.route';
import { userRouter } from '../modules/User/user.routes';
import { authRoutes } from '../modules/Auth/Auth.routes';
import { eventRoutes } from '../modules/Events/event.routes';
import { profileRoutes } from '../modules/Profile/profile.routes';

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
  {
    path: '/profiles',
    route: profileRoutes,
  },
];

moduleRoutes.forEach((item) => router.use(item.path, item.route));

export default router;
