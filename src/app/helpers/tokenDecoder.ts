/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response } from 'express';
import status from 'http-status';
import AppError from '../errors/AppError';
import config from '../config';
import { jwtHelpers } from './jwtHelpers';

export  type TJwtPayload = {
    email: string;
    role: string;
    iat: number;
    exp: number;
}

export const tokenDecoder = (req: Request) => {
  const token = req.cookies?.token;
  // console.log(token);
  if (!token) {
    throw new AppError(status.UNAUTHORIZED, 'You Are Not Authorized');
  }
  const decoded = jwtHelpers.verifyToken(
    token as string,
    config.jwt.ACCESS_TOKEN_SECRET as string,
  );
  return decoded;
};
