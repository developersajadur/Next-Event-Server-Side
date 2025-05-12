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
router.get('/profile', authControlller.getProfileInfo);
router.post('/forget-password', authControlller.forgotPassword);
router.post('/reset-password', authControlller.resetPassword);
router.post('/logout', authControlller.logOut);

export const authRoutes = router;
