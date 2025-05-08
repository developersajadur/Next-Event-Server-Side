import { Router } from 'express';
import { eventRoutes } from '../modules/events/event.routes';
import { inviteRoute } from '../modules/invite/invite.route';
import { participantRoute } from '../modules/participant/participant.route';
import { paymentRoute } from '../modules/payment/payment.route';
import { profileRoutes } from '../modules/profile/profile.routes';
import { SSLRoutes } from '../modules/sslcommerz/sslcommerz.route';
import { userRouter } from '../modules/User/user.routes';
import { ReviewRouter } from '../modules/Review/review.router';
import { paymentRoute } from '../modules/payment/payment.route';
import { participantRoute } from '../modules/participant/participant.route';
import { inviteRoute } from '../modules/invite/invite.route';
import { eventRoutes } from '../modules/events/event.routes';
import { profileRoutes } from '../modules/profile/profile.routes';
import { authRoutes } from '../modules/Auth/auth.route';
const router = Router();

const moduleRoutes = [
  {
    path: '/user',
    route: userRouter,
  },
  {
    path: '/auth',
    route:authRoutes,
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
