import status from 'http-status';
import jwt, { Secret, SignOptions } from 'jsonwebtoken'; 
import AppError from '../errors/AppError';

interface CustomPayload {
  id: string;
  name?: string;
  role?: 'USER' | 'ADMIN';
  email?: string;
  profileImage?: string | null;
}

const createToken = (
  payload: CustomPayload,
  secret: Secret,
  expiresIn: string | number | undefined,
): string => {
  if (!secret || typeof secret !== 'string') {
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      'JWT Secret is missing or invalid',
    );
  }

  if (
    !expiresIn ||
    (typeof expiresIn !== 'string' && typeof expiresIn !== 'number')
  ) {
    throw new AppError(status.INTERNAL_SERVER_ERROR, 'JWT Expiry is invalid');
  }

  const signOptions: SignOptions = {
    expiresIn: expiresIn as SignOptions['expiresIn'],
    algorithm: 'HS256',
  };

  try {
    return jwt.sign(payload, secret, signOptions);
  } catch (error) {
    console.error('Error creating token:', error);
    throw new AppError(status.INTERNAL_SERVER_ERROR, 'Failed to create JWT');
  }
};

// Verify token
const verifyToken = (token: string, secret: Secret): CustomPayload => {
  try {
    const decoded = jwt.verify(token, secret) as CustomPayload;
    if (!decoded.id) {
      throw new AppError(status.FORBIDDEN, 'Token missing essential fields');
    }
    return decoded;
  } catch (error) {
    const err = error as Error;
    console.error('Token verification error:', err);
    if (err.name === 'JsonWebTokenError') {
      throw new AppError(status.FORBIDDEN, 'Invalid token signature');
    } else if (err.name === 'TokenExpiredError') {
      throw new AppError(status.FORBIDDEN, 'Token expired');
    }
  
    throw new AppError(status.FORBIDDEN, 'Forbidden');
  }
};

export const jwtHelpers = {
  createToken,
  verifyToken,
};
