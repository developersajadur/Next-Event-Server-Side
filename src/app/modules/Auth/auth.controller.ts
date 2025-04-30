import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../../../../SQL/Prisma/PH_health_care/src/shared/catchAsync';
import sendResponse from '../../../../../../SQL/Prisma/PH_health_care/src/shared/sendResponse';
import { authService } from './auth.service';

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.loginUser(req.body);
  const { refreshToken } = result;

  res.cookie('refreshToken', refreshToken, {
    secure: false,
    httpOnly: true,
  });
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Logged in user successfully',
    data: {
      accessToken: result.accessToken,
      needPasswordChange: result.needPasswordChange,
    },
  });
});

// refreshToken
const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;
  const result = await authService.refreshToken(refreshToken);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Access token generated successfully',
    data: result,
  });
});
//
const passwordChange = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const user = req.user;
    const result = await authService.passwordChange(user, req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'password changed successfully',
      data: result,
    });
  },
);

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  await authService.forgotPassword(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'check your email',
    data: null,
  });
});

// reset-password
const resetPassword = catchAsync(async (req: Request, res: Response) => {
  //   const token = req.headers.authorization || "";
  const token = req.headers.authorization?.replace('Bearer ', '') || '';

  await authService.resetPassword(token, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'password reset ',
    data: null,
  });
});
export const authControlller = {
  loginUser,
  refreshToken,
  passwordChange,
  forgotPassword,
  resetPassword,
};
