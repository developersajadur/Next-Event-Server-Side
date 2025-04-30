/* eslint-disable @typescript-eslint/no-explicit-any */

import { Role } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import status from 'http-status';
import config from '../config';
import AppError from '../errors/AppError';
import catchAsync from '../helpers/catchAsync';
import { jwtHelpers } from '../helpers/jwtHelpers';
import prisma from '../shared/prisma';



const Auth = (...requiredRoles: Role[]) => {

  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;

    if (!token) {
      throw new AppError(status.UNAUTHORIZED, 'Authorization token missing!');
    }

    const decoded = jwtHelpers.verifyToken(token, config.jwt.ACCESS_TOKEN_SECRET as string);

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
    (req as any).user = user
    next();
  });
};

export default Auth;
