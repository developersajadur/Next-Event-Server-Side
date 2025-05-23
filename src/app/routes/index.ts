import { Router } from 'express';
import { authRoutes } from '../modules/auth/auth.route';
import { eventRoutes } from '../modules/event/event.routes';
import { inviteRoute } from '../modules/invite/invite.route';
import { participantRoute } from '../modules/participant/participant.route';
import { paymentRoute } from '../modules/payment/payment.route';
import { SSLRoutes } from '../modules/sslcommerz/sslcommerz.route';
import { userRouter } from '../modules/user/user.routes';
import { ReviewRouter } from '../modules/review/review.router';
import { profileRoutes } from '../modules/profile/profile.routes';
import { metaRoute } from '../modules/meta/meta.route';
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
  {
    path: '/meta',
    route: metaRoute,
  },
];

moduleRoutes.forEach((item) => router.use(item.path, item.route));

export default router;
