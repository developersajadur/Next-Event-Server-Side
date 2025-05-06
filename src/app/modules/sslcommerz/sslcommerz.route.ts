
import { Router } from 'express';
import { SSLController } from './sslcommerz.controller';

const router = Router();

// Define routes

router.get(
    '/check-validate-payment',
    SSLController.validatePaymentService
)

router.post('/ipn', SSLController.handleIPN);

export const SSLRoutes = router;