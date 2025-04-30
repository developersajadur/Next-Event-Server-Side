import express from 'express';
import { authControlller } from './auth.controller';
import Auth from '../../middlewares/Auth';
import { Role } from '@prisma/client';
const router = express.Router();

router.post('/login', authControlller.loginUser);
router.post('/refreshToken', authControlller.refreshToken);

router.post("/change-password",Auth(Role.USER, Role.ADMIN), authControlller.passwordChange)
export const authRoutes = router;
