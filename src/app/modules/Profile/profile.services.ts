import { Request } from 'express';
import prisma from '../../shared/prisma';
import { fileUploads } from '../../helpers/fileUploader';
import AppError from '../../errors/AppError';
import status from 'http-status';

const getSingleProfile = async (id: string) => {
  const result = await prisma.user.findUniqueOrThrow({ where: { id } });
  return result;
};
const updateUserProfile = async (id: string, req: Request) => {
  await prisma.user.findUniqueOrThrow({ where: { id } });
  const payload = req.body;
  if (req.file) {
    const file = req.file as Express.Multer.File;
    const uploadToCloudinary = await fileUploads.uploadToCloudinary(file);
    payload.profileImage = uploadToCloudinary.secure_url;
  }

  const result = await prisma.user.update({
    where: { id },
    data: payload,
  });

  return result;
};



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
