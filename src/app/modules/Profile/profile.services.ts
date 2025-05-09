import status from 'http-status';
import AppError from '../../errors/AppError';
import prisma from '../../shared/prisma';
import { UpdateProfilePayload } from './profile.interface';

const getSingleProfile = async (id: string) => {
  const result = await prisma.user.findUniqueOrThrow({ where: { id } });
  return result;
};

const updateUserProfile = async (userId: string, payload:UpdateProfilePayload) => {
// console.log(payload)
  const userExist = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });

  if (!userExist) {
    throw new AppError(404, 'user not found');
  }
  const result = await prisma.user.update({
    where: {
      id: userId,
    },
    data: payload,
    select: {
      id: true,
      name: true,
      email: true,
      address: true,
      phoneNumber: true,
      profileImage: true,
      occupation: true,
    },
  });
  await prisma.user.findUniqueOrThrow({ where: { id:userId } });
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
