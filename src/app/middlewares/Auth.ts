import { Role } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { Secret } from 'jsonwebtoken';
import config from '../config';
import AppError from '../errors/AppError';
import { jwtHelpers } from '../helpers/jwtHelpers';
import prisma from '../shared/prisma';

export interface ITokenUser {
  email: string;
  role: Role;
  id: string;
  iat?: number;
  exp?: number;
}

const auth = (...roles: string[]) => {
  return async (
    req: Request & { user?: ITokenUser },
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
      }

      const verifiedUser = (await jwtHelpers.verifyToken(
        token as string,
        config.jwt.ACCESS_TOKEN_SECRET as Secret,
      )) as ITokenUser;

      if (verifiedUser.exp && Date.now() >= verifiedUser.exp * 1000) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'Token expired.');
      }

      const isUserExist = await prisma.user.findUnique({
        where: { id: verifiedUser.id },
      });

      if (!isUserExist) {
        throw new AppError(httpStatus.FORBIDDEN, 'User Not Found');
      }

      if (isUserExist.isBlocked) {
        throw new AppError(httpStatus.FORBIDDEN, 'You are blocked!');
      }

      if (isUserExist.isDeleted) {
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
