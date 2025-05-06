/* eslint-disable @typescript-eslint/no-explicit-any */

import { Role } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { Secret } from 'jsonwebtoken';
import config from '../config';
import AppError from '../errors/AppError';
import { jwtHelpers } from '../helpers/jwtHelpers';

const auth = (...roles: string[]) => {


  return async (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction,
  ) => {
    try {
  const token = req.headers.authorization?.split(' ')[1]; 


      if (!token) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
      }

      const verifiedUser = jwtHelpers.verifyToken(
        token as string,
        config.jwt.ACCESS_TOKEN_SECRET as Secret,
      );
   

      req.user = verifiedUser;
     

      if (roles.length && !roles.includes(verifiedUser.role)) {
        throw new AppError(httpStatus.FORBIDDEN, 'Forbidden!');
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth;
