import status from 'http-status';
import jwt, { Secret } from 'jsonwebtoken';
import AppError from '../errors/AppError';
interface CustomJwtPayload {
  id: string
  role?: 'USER' | 'ADMIN'
  email?: string
  profileImage?: string,

}
const createToken = (payload: CustomJwtPayload, secret: Secret, expiresIn: string | number) => {
  const token = jwt.sign(payload, secret, {
    algorithm: 'HS256',
    expiresIn,
  });
  return token;
};

const verifyToken = async (token: string, secret: Secret) => {
  try {
    const decoded = jwt.verify(token, secret) as CustomJwtPayload;
    return decoded;
  } catch (error) {
    // console.log('JWT Error:', error); 
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