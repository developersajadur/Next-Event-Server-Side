"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_route_1 = require("../modules/auth/auth.route");
const event_routes_1 = require("../modules/event/event.routes");
const invite_route_1 = require("../modules/invite/invite.route");
const participant_route_1 = require("../modules/participant/participant.route");
const payment_route_1 = require("../modules/payment/payment.route");
const sslcommerz_route_1 = require("../modules/sslcommerz/sslcommerz.route");
const user_routes_1 = require("../modules/user/user.routes");
const review_router_1 = require("../modules/review/review.router");
const profile_routes_1 = require("../modules/profile/profile.routes");
const router = (0, express_1.Router)();
const moduleRoutes = [
    {
        path: '/user',
        route: user_routes_1.userRouter,
    },
    {
        path: '/auth',
        route: auth_route_1.authRoutes,
    },
    {
        path: '/review',
        route: review_router_1.ReviewRouter,
    },
    {
        path: '/init-payments',
        route: sslcommerz_route_1.SSLRoutes,
    },
    {
        path: '/payments',
        route: payment_route_1.paymentRoute,
    },
    {
        path: '/events',
        route: event_routes_1.eventRoutes,
    },
    {
        path: '/profiles',
        route: profile_routes_1.profileRoutes,
    },
    {
        path: '/participants',
        route: participant_route_1.participantRoute,
    },
    {
        path: '/invites',
        route: invite_route_1.inviteRoute,
    },
];
moduleRoutes.forEach((item) => router.use(item.path, item.route));
exports.default = router;
