import * as bcrypt from 'bcrypt';
import config from '../../config';
import AppError from '../../errors/AppError';
import { jwtHelpers } from '../../helpers/jwtHelpers';
import prisma from '../../shared/prisma';

const loginUser = async (data: { email: string; password: string }) => {
  const result = await prisma.user.findUniqueOrThrow({
    where: {
      email: data.email,
    },
  });
  if (result.isBlocked) {
    throw new AppError(403, 'User is blocked');
  }

  const isCorrectPassword: boolean = await bcrypt.compare(
    data.password,
    result.password,
  );

  if (!isCorrectPassword) {
    throw new AppError(403, 'Password did not match');
  }

  const accessToken = jwtHelpers.createToken(
    { email: result.email, role: result.role, id: result.id },
    config.jwt.ACCESS_TOKEN_SECRET as string,
    config.jwt.ACCESS_TOKEN_EXPIRES_IN as string
  );

  const refreshToken = jwtHelpers.createToken(
    { email: result.email, role: result.role, id: result.id },
    config.jwt.REFRESH_TOKEN_SECRET as string,
    config.jwt.REFRESH_TOKEN_EXPIRES_IN as string
  );

  return {
    accessToken,
    refreshToken,
  };
};

const refreshToken = async (token: string) => {
  let decodedData;

  try {
    decodedData = jwtHelpers.verifyToken(
      token,
      config.jwt.REFRESH_TOKEN_SECRET as string,
    );
    console.log('decoded data', decodedData);
  } catch (error) {
    throw new Error('You are not authorized');
  }

  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: decodedData.email,
    },
  });

  const accessToken = jwtHelpers.createToken(
    { email: userData.email, role: userData.role },
    config.jwt.ACCESS_TOKEN_SECRET as string,
    config.jwt.ACCESS_TOKEN_EXPIRES_IN as string,
  );

  return {
    accessToken,
  };
};

// password change
const passwordChange = async (user: any, payload: any) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });
  if (userData.isBlocked) {
    throw new AppError(403, 'User is blocked');
  }

  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.oldPassword,
    userData.password,
  );

  if (!isCorrectPassword) {
    throw new AppError(401, 'Password Incorrect');
  }

  const hashPassword = await bcrypt.hash(payload.newPassword, 12);
  await prisma.user.update({
    where: {
      email: userData.email,
    },
    data: {
      password: hashPassword,
    },
  });
  return {
    message: 'Password changed successfully',
  };
};

export const authService = {
  loginUser,
  refreshToken,
  passwordChange,
};
