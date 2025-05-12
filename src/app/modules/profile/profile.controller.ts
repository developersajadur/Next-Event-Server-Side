import { Request, Response } from 'express';
import httpStatus, { status } from 'http-status';
import AppError from '../../errors/AppError';
import catchAsync from '../../helpers/catchAsync';
import sendResponse from '../../helpers/sendResponse';
import { ProfileService } from '../profile/profile.services';
import { ITokenUser } from '../user/user.interface';

// get Single Profile
const getSingleProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await ProfileService.getSingleProfile(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Profile fetched  successfully',
    data: result,
  });
});

// update profile
export const updateUserProfile = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.params.userId;
    const file = req.file;
    const bodyData = req.body;

    const result = await ProfileService.updateUserProfile(
      userId,
      bodyData,
      file,
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Profile updated successfull',
      data: result,
    });
  },
);

// get myProfile
const getMyProfileData = catchAsync(
  async (req: Request & { user?: ITokenUser }, res) => {
    const user = req.user;
    if (!user) {
      throw new AppError(status.UNAUTHORIZED, 'user not found');
    }

    const result = await ProfileService.getMyProfileData(user.id);

    sendResponse(res, {
      statusCode: status.CREATED,
      success: true,
      message: 'Profile updated successfully',
      data: result,
    });
  },
);

export const ProfileController = {
  getSingleProfile,
  updateUserProfile,
  getMyProfileData,
};
