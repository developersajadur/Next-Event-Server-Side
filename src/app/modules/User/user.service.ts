import bcrypt from 'bcrypt';
import { Request } from 'express';
import AppError from '../../errors/AppError';
import { fileUploads } from '../../helpers/fileUploader';
import prisma from '../../shared/prisma';
import { publicUserSelectFields } from './user.interface';
import { IFile } from '../../interfaces/file';
import status from 'http-status';

// createUserIntoDB
const createUserIntoDB = async (req: Request) => {
  const isUserExits = await prisma.user.findUnique({
    where: {
      email: req.body.email,
    },
  });

  if (isUserExits) {
    throw new AppError(status.CONFLICT, 'this email is already register');
  }

  try {
    let profileImage: string | undefined;

    if (req.file) {
      const file = req.file as IFile;
      const cloudinaryRes = await fileUploads?.uploadToCloudinary(file);
      profileImage = cloudinaryRes.secure_url;
    }

    const hashPassword = await bcrypt.hash(req.body.password, 12);

    const userData = {
      name: req.body.name,
      email: req.body.email,
      password: hashPassword,
      phoneNumber: req.body.phoneNumber,
      profileImage,
      address: req.body.address || null,
      bio: req.body.bio || null,
      gender: req.body.gender || null,
      occupation: req.body.occupation || null,
    };
    // console.log(userData);

    const result = await prisma.user.create({
      data: userData,
    });

    return result;
  } catch (error: any) {
    console.log(error);
    throw new AppError(500, 'Failed to create user');
  }
};

// get User
const getAllUsersFromDB = async () => {
  const result = await prisma.user.findMany({
    select: publicUserSelectFields,
  });
  return result;
};
// get single user by id
const getSingleUserFromDB = async (id: string) => {
  const result = await prisma.user.findUniqueOrThrow({
    where: {
      id,
    },
  });
  if (result.isBlocked) {
    throw new AppError(403, 'User is blocked');
  }
  return result;
};

// delete user
const deleteUserFromDB = async (id: string) => {
  const userData = await prisma.user.findFirstOrThrow({
    where: {
      id,
    },
  });
  if (userData.isBlocked) {
    throw new AppError(403, 'User is blocked');
  }
  const result = await prisma.user.delete({
    where: {
      id,
    },
  });
  return result;
};
export const userService = {
  createUserIntoDB,
  getSingleUserFromDB,
  getAllUsersFromDB,
  deleteUserFromDB,
};
