import { Role } from '@prisma/client';
import express from 'express';
import Auth from '../../middlewares/Auth';
import { authControlller } from './auth.controller';
const router = express.Router();

router.post('/login', authControlller.loginUser);
router.post('/refreshToken', authControlller.refreshToken);

router.post(
  '/change-password',
  Auth(Role.USER, Role.ADMIN),
  authControlller.passwordChange,
);
router.post(
  '/forgot-password',
  Auth(Role.USER, Role.ADMIN),
  authControlller.forgotPassword,
);
router.post(
  '/reset-password',
  Auth(Role.USER, Role.ADMIN),
  authControlller.resetPassword,
);

export const authRoutes = router;
