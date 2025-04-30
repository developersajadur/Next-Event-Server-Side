import * as bcrypt from 'bcrypt';
import config from '../../config';
import { jwtHelpers } from '../../helpers/jwtHelpers';
import prisma from '../../shared/prisma';

const loginUser = async (data: { email: string; password: string }) => {
  const result = await prisma.user.findUniqueOrThrow({
    where: {
      email: data.email,
    },
  });

  const isCorrectPassword: boolean = await bcrypt.compare(
    data.password,
    result.password,
  );

  if (!isCorrectPassword) {
    throw new Error('Password did not match');
  }

  const accessToken = jwtHelpers.createToken(
    { email: result.email, role: result.role },
    config.jwt.ACCESS_TOKEN_SECRET as string,
    config.jwt.ACCESS_TOKEN_EXPIRES_IN as string
  );

  const refreshToken = jwtHelpers.createToken(
    { email: result.email, role: result.role },
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

export const authService = {
  loginUser,
  refreshToken,
};
