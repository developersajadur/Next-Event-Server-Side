import { Request, Response } from 'express';
import httpStatus from 'http-status';
import config from '../../config';
import catchAsync from '../../helpers/catchAsync';
import sendResponse from '../../helpers/sendResponse';
import { IAuthenticatedUser, IProfileInfo } from './auth.interface';
import { authService } from './auth.service';

// Login user
const loginUser = catchAsync(
  async (req: Request & { user?: IAuthenticatedUser }, res: Response) => {
    const result = await authService.loginUser(req.body);
    const { refreshToken } = result;

    res.cookie('refreshToken', refreshToken, {
      secure: config.node_env === 'production',
      httpOnly: true,
      sameSite: 'none',
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Logged in user successfully',
      data: {
        accessToken: result.accessToken,
      },
    });
  },
);

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

// password change

const passwordChange = catchAsync(
  async (req: Request & { user?: IAuthenticatedUser }, res: Response) => {
    const user = req.user!;
    const bodyData = req.body;
    const result = await authService.passwordChange(user, bodyData);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'password changed successfully',
      data: result,
    });
  },
);

// get my profile
const getProfileInfo = catchAsync(
  async (req: Request & { user?: IProfileInfo }, res: Response) => {
    const authToken = req.headers.authorization;
    if (!authToken || !authToken.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const token = authToken.split(' ')[1];
    const result = await authService.getProfileInfo(token);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'profile data fetched successfully',
      data: result,
    });
  },
);

// forgot password
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
  const token = req.headers['authorization'] || '';

  if (!token) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: 'Token is required!',
      data: null,
    });
  }

  try {
    await authService.resetPassword(token, req.body);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Password reset successfully!',
      data: null,
    });
  } catch (error) {
    sendResponse(res, {
      success: false,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: 'Something went wrong',
      data: null,
    });
  }
});

// log out
const logOut = async (req: Request, res: Response) => {
  res
    .clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
    })
    .status(200)
    .json({ success: true, message: 'Logged out successfully' });
};

export const authControlller = {
  loginUser,
  refreshToken,
  getProfileInfo,
  passwordChange,
  forgotPassword,
  resetPassword,
  logOut,
};
