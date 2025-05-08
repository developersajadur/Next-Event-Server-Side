import { Router } from 'express';
import { SSLRoutes } from '../modules/sslcommerz/sslcommerz.route';
import { userRouter } from '../modules/user/user.routes';
import { ReviewRouter } from '../modules/review/review.router';
import { paymentRoute } from '../modules/payment/payment.route';
import { participantRoute } from '../modules/participant/participant.route';
import { inviteRoute } from '../modules/invite/invite.route';
import { eventRoutes } from '../modules/event/event.routes';
import { profileRoutes } from '../modules/profile/profile.routes';
import { authRoutes } from '../modules/auth/auth.route';

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
    path: '/review',
    route: ReviewRouter,
  },
  {
    path: '/init-payments',
    route: SSLRoutes,
  },
  {
    path: '/payments',
    route: paymentRoute,
  },
  {
    path: '/events',
    route: eventRoutes,
  },
  {
    path: '/profiles',
    route: profileRoutes,
  },
  {
    path: '/participants',
    route: participantRoute,
  },
  {
    path: '/invites',
    route: inviteRoute,
  },
];

moduleRoutes.forEach((item) => router.use(item.path, item.route));

export default router;
