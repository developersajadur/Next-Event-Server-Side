
import { Router } from 'express';
import { SSLController } from './sslcommerz.controller';

const router = Router();

// Define routes

router.post(
    '/check-validate-payment',
    SSLController.validatePaymentService
)

export const SSLRoutes = router;