import { NextFunction, Request, Response } from 'express';
import status from 'http-status';
import AppError from '../errors/AppError';
import catchAsync from '../helpers/catchAsync';
import { jwtHelpers } from '../helpers/jwtHelpers';
import prisma from '../shared/prisma';
import { Role } from '@prisma/client';
import config from '../config';

const Auth = (...requiredRoles: Role[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // const token = req.headers.authorization;
    const token = req.headers.authorization?.split(' ')[1]; 


    if (!token) {
      throw new AppError(status.UNAUTHORIZED, 'Authorization token missing!');
    }

    const decoded = jwtHelpers.verifyToken(token, config.jwt.ACCESS_TOKEN_SECRET as string);
    (req as any).user = decoded;
    const { email } = decoded;

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
