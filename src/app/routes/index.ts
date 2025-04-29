import { Router } from 'express';
import { userRouter } from '../modules/User/user.routes';

const router = Router();

const moduleRoutes = [
  {
    path: '/user',
    route: userRouter,
  },
];

moduleRoutes.forEach((item) => router.use(item.path, item.route));

export default router;
