import * as bcrypt from 'bcrypt';
import status from 'http-status';
import { Secret } from 'jsonwebtoken';
import config from '../../config';
import AppError from '../../errors/AppError';
import { jwtHelpers } from '../../helpers/jwtHelpers';
import prisma from '../../shared/prisma';
import emailSender from './emailSender';

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

// forgot password
const forgotPassword = async (payload: { email: string }) => {
  // console.log(payload)

  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
    },
  });

  // token generate
  const resetPassToken = jwtHelpers.createToken(
    { email: userData.email, role: userData.role },
    config.jwt.RESET_PASSWORD_SECRET as Secret,
    config.jwt.RESET_PASSWORD_TOKEN_EXP_IN as string,
  );

  // reset password link
  const resetPassLink =
    config.jwt.RESET_PASSWORD_LINK +
    `?userId=${userData.id}&token=${resetPassToken}`;
  // console.log(resetPassLink);
  await emailSender(
    userData.email,

    `<div>
    <p> Dear User,</p>
    <p> Your password reset Link 
         <a href=${resetPassLink}>
         <button>
         Reset Password
         <button>
         </a>
    </p>
    </div>
    `,
  );
};

// reset-password
const resetPassword = async (
  token: string,
  payload: { id: string; password: string },
) => {
  try {
    // Ensure the user exists
    await prisma.user.findUniqueOrThrow({
      where: {
        id: payload.id,
      },
    });

    // Verify the reset password token
    const decoded = jwtHelpers.verifyToken(
      token,
      config.jwt.RESET_PASSWORD_SECRET as Secret,
    );

    // Hash the new password
    const hashedPassword = await bcrypt.hash(payload.password, 12);

    // Update the user's password in the database
    await prisma.user.update({
      where: {
        id: payload.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    return { success: true, message: 'Password updated successfully' };
  } catch (error) {
    throw new AppError(status.FORBIDDEN, 'Forbidden: Unable to reset password');
  }
};

export const authService = {
  loginUser,
  refreshToken,
  passwordChange,
  forgotPassword,
  resetPassword,
};
