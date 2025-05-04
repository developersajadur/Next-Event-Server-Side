import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { Secret } from 'jsonwebtoken';
import config from '../config';
import AppError from '../errors/AppError';
import { jwtHelpers } from '../helpers/jwtHelpers';
import prisma from '../shared/prisma';
import { IAuthenticatedUser } from '../modules/Auth/auth.interface';

const auth = (...roles: string[]) => {

  return async (
    req: Request & { user?: IAuthenticatedUser },
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const token = req.headers.authorization;
      // console.log('Incoming token:', token);
      if (!token) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
      }

      const verifiedUser = jwtHelpers.verifyToken(
        token as string,
        config.jwt.ACCESS_TOKEN_SECRET as Secret,
      );

      if (verifiedUser.exp && Date.now() >= verifiedUser.exp * 1000) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'Token expired.');
      }
      //   console.log(verifiedUser)
      const isUserExist = await prisma.user.findUniqueOrThrow({
        where: {
          id: verifiedUser.id,
        },
      })

      if(isUserExist.isBlocked){
        throw new AppError(httpStatus.FORBIDDEN, 'You are blocked!');
      }else if(isUserExist.isDeleted){
        throw new AppError(httpStatus.FORBIDDEN, 'You are deleted!');
      }

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