import status from 'http-status';
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import AppError from '../errors/AppError';

const createToken = (payload: any, secret: Secret, expiresIn: any) => {
  const token = jwt.sign(payload, secret, {
    algorithm: 'HS256',
    expiresIn,
  });
  return token;
};

const verifyToken = (token: string, secret: Secret) => {
  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    return decoded;
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      throw new AppError(status.FORBIDDEN, 'Invalid token signature bro');
    } else if (error.name === 'TokenExpiredError') {
      throw new AppError(status.FORBIDDEN, 'Token expired');
    }
    throw new AppError(status.FORBIDDEN, 'Forbidden');
  }
};

export const jwtHelpers = {
  createToken,
  verifyToken,
};
