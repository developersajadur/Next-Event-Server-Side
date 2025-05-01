import express from 'express';
import { authControlller } from './auth.controller';
const router = express.Router();

router.post('/login', authControlller.loginUser);
router.post('/refreshToken', authControlller.refreshToken);


export const authRoutes = router;
