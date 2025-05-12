import * as bcrypt from 'bcrypt';
import { Secret } from 'jsonwebtoken';
import config from '../../config';
import AppError from '../../errors/AppError';
import { jwtHelpers } from '../../helpers/jwtHelpers';
import prisma from '../../shared/prisma';
import { safeUserData } from './auth.constant';
import {
  IAuthenticatedUser,
  ILoginUser,
  IPasswordChangePayload,
} from './auth.interface';
import emailSender from './emailSender';

// login user
const loginUser = async (data: ILoginUser) => {
  const userData = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });
  if (!userData) {
    throw new AppError(404, 'User not found!');
  }
  if (userData.isBlocked) {
    throw new AppError(403, 'User is blocked!');
  }

  const isCorrectPassword: boolean = await bcrypt.compare(
    data.password,
    userData.password,
  );

  if (!isCorrectPassword) {
    throw new AppError(403, 'You have given a wrong password!');
  }

  // token payload
  const tokenPayload = {
    id: userData.id,
    name: userData.name,
    email: userData.email,
    role: userData.role,
    profileImage: userData.profileImage,
  };

  // access token
  const accessToken = jwtHelpers.createToken(
    tokenPayload,
    config.jwt.ACCESS_TOKEN_SECRET,
    config.jwt.ACCESS_TOKEN_EXPIRES_IN as string,
  );

  // refresh token
  const refreshToken = jwtHelpers.createToken(
    tokenPayload,
    config.jwt.REFRESH_TOKEN_SECRET as string,
    config.jwt.REFRESH_TOKEN_EXPIRES_IN as string,
  );

  return {
    accessToken,
    refreshToken,
  };
};

// refresh

const refreshToken = async (token: string) => {
  let decodedData;

  try {
    decodedData = await jwtHelpers.verifyToken(
      token,
      config.jwt.REFRESH_TOKEN_SECRET as string,
    );
  } catch {
    throw new Error('You are not authorized');
  }

  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: decodedData.email,
      isBlocked: false,
    },
  });

  const tokenPayload = {
    name: userData.name,
    email: userData.email,
    role: userData.role,
    profileImage: userData.profileImage,
    id: userData.id,
  };

  const accessToken = jwtHelpers.createToken(
    tokenPayload,
    config.jwt.ACCESS_TOKEN_SECRET as string,
    config.jwt.ACCESS_TOKEN_EXPIRES_IN as string,
  );

  return {
    accessToken,
  };
};

// password change
const passwordChange = async (
  user: IAuthenticatedUser,
  payload: IPasswordChangePayload,
): Promise<{ message: string }> => {
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

// getProfileInfo
const getProfileInfo = async (token: string) => {
  const decoded = await jwtHelpers.verifyToken(
    token,
    config.jwt.ACCESS_TOKEN_SECRET as string,
  );
  const userId = decoded?.id;
  // console.log(userId)
  if (!userId) {
    throw new AppError(401, 'Invalid Token Payload');
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: safeUserData,
  });
  if (!user) {
    throw new AppError(404, 'User not found');
  }

  return user;
};

// forgot password
const forgotPassword = async (payload: { email: string }) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      isBlocked: false,
    },
  });

  // token generate
  const resetPassToken = jwtHelpers.createToken(
    { email: userData.email, role: userData.role, id: userData.id },
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

    `<div style="font-family: Arial, sans-serif; background-color: #f4f7fa; padding: 20px; border-radius: 8px;">
    <p style="font-size: 16px; color: #333;">Dear User,</p>
  
    <p style="font-size: 16px; color: #333;">
      We received a request to reset your password. Please click the button below to reset your password.
    </p>
  
    <p style="margin-top: 20px;">
      <a href="${resetPassLink}" 
         style="text-decoration: none; display: inline-block; background-color: #4CAF50; padding: 12px 24px; color: white; font-size: 16px; border-radius: 4px; text-align: center; font-weight: bold; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); transition: background-color 0.3s ease;">
        <i class="fas fa-lock" style="margin-right: 8px;"></i> Reset Password
      </a>
    </p>
  
    <p style="font-size: 14px; color: #777;">If you did not request a password reset, please ignore this email.</p>
  </div>
  
    `,
  );
  return {
    message: 'A password reset link has been sent to your email.',
  };
};

// reset-password
const resetPassword = async (
  token: string,
  payload: { userId: string; newPassword: string },
) => {
  try {
    const User = await prisma.user.findUniqueOrThrow({
      where: {
        id: payload.userId,
      },
    });

    if (User.isBlocked) {
      throw new AppError(403, 'User is blocked');
    }

    // Verify
    const decoded = jwtHelpers.verifyToken(
      token,
      config.jwt.RESET_PASSWORD_SECRET as Secret,
    );

    if (decoded.email !== User.email) {
      throw new AppError(403, 'Invalid reset token');
    }
    // hash password
    const hashedPassword = await bcrypt.hash(payload.newPassword, 12);

    // Update password
    await prisma.user.update({
      where: {
        id: payload.userId,
      },
      data: {
        password: hashedPassword,
      },
    });

    return { success: true, message: 'Password updated successfully' };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Reset password error:', error);
    throw new AppError(403, 'Forbidden: Unable to reset password');
  }
};

export const authService = {
  loginUser,
  refreshToken,
  passwordChange,
  forgotPassword,
  resetPassword,
  getProfileInfo,
};
