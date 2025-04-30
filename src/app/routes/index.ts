import { Router } from 'express';
import { authRoutes } from '../modules/Auth/Auth.routes';
import { userRouter } from '../modules/User/user.routes';

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
];

moduleRoutes.forEach((item) => router.use(item.path, item.route));

export default router;
