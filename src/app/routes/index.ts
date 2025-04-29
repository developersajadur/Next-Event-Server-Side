import { Router } from 'express';

const router = Router();

const moduleRoutes = [
  {
    path: '/',
    route: customerRoute,
  }
];

moduleRoutes.forEach((item) => router.use(item.path, item.route));

export default router;
