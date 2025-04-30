import status from 'http-status';
import AppError from '../errors/AppError';
import catchAsync from '../helpers/catchAsync';
import { jwtHelpers } from '../helpers/jwtHelpers';
import prisma from '../shared/prisma';
import { Role } from '@prisma/client';
import config from '../config';

const Auth = (...requiredRoles: Role[]) => {
  return catchAsync(async (req, res, next) => {
    const token = req.cookies?.token;
    console.log(token);

    // console.log('Received Cookies:', req.cookies.refreshToken);
    // console.log('Extracted Token:', token);

    if (!token) {
      throw new AppError(status.UNAUTHORIZED, 'Authorization token missing!');
    }

    let decoded;
    try {
      decoded = jwtHelpers.verifyToken(
        token,
        config.jwt.ACCESS_TOKEN_SECRET as string,
      );
    } catch (err) {
      // console.error('Token verification failed:', err);
      throw new AppError(status.UNAUTHORIZED, 'Invalid or expired token');
    }

    // console.log('Decoded Token:', decoded);

    const { email, exp } = decoded;

    if (exp && Date.now() >= exp * 1000) {
      throw new AppError(status.UNAUTHORIZED, 'Token expired.');
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError(status.UNAUTHORIZED, 'User not found!');
    }

    if (user.isBlocked) {
      throw new AppError(status.FORBIDDEN, 'User is blocked!');
    }

    if (user.isDeleted) {
      throw new AppError(status.FORBIDDEN, 'User is deleted!');
    }

    if (requiredRoles.length && !requiredRoles.includes(user.role)) {
      throw new AppError(status.UNAUTHORIZED, 'You are not authorized!');
    }

    next();
  });
};

export default Auth;
