import status from 'http-status';
import AppError from '../../errors/AppError';
import { fileUploads } from '../../helpers/fileUploader';
// import { IFile } from '../../interfaces/file';
import prisma from '../../shared/prisma';
import { UpdateProfilePayload } from '../profile/profile.interface';
import { selectFields } from './profile.constraint';

// get single profile
const getSingleProfile = async (id: string) => {
  const result = await prisma.user.findUniqueOrThrow({ where: { id } });
  return result;
};

// update profile
const updateUserProfile = async (
  userId: string,
  payload: UpdateProfilePayload,
  file?: Express.Multer.File

) => {
  try {
    const userExist = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    if (!userExist) {
      throw new AppError(404, 'User not found');
    }
    
    // if (!userExist.password) {
    //   throw new AppError(403, 'Social login users are not allowed to update their profile');
    // }
    const { userId: _, ...updateData } = payload;

    if (file) {
      const uploadResult = await fileUploads.uploadToCloudinary(file);
      updateData.profileImage = uploadResult.secure_url;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: selectFields,
    });
    const {password, ...rest} = user

    const result = {
      ...rest,
      isSocialLogin: !password,
    };
    return result;
  } catch (error) {
    throw new AppError(403, 'failed ');
  }
};

// get myProfile
const getMyProfileData = async (id: string) => {
  const result = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });
  if (!result || result.isBlocked || result.isDeleted) {
    throw new AppError(status.NOT_FOUND, 'User Not Found');
  }
  const { password, ...user } = result;
  return user;
};


export const ProfileService = {
  getSingleProfile,
  updateUserProfile,
  getMyProfileData,
};
