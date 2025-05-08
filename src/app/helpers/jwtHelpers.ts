import status from 'http-status';
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import AppError from '../errors/AppError';
interface JwtPayload {
  id: string
  role?: 'USER' | 'ADMIN'
  email?: string
  profileImage?: string,

}
const createToken = (payload: JwtPayload, secret: Secret, expiresIn: string | number) => {
  const token = jwt.sign(payload, secret, {
    algorithm: 'HS256',
    expiresIn,
  });
  return token;
};

const verifyToken = async (token: string, secret: Secret) => {
  try {
    console.log("Token secret:", secret);
    const decoded = jwt.verify(token, secret) as JwtPayload;
    console.log("Decoded Token:", decoded);
    return decoded;
  } catch (error) {
    console.error('JWT Error:', error); 
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