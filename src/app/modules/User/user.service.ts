import { Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import { Request } from 'express';
import AppError from '../../errors/AppError';
import { fileUploads } from '../../helpers/fileUploader';
import { IFile } from '../../interfaces/file';
import prisma from '../../shared/prisma';
import { publicUserSelectFields } from './user.interface';

// createUserIntoDB
const createUserIntoDB = async (req: Request) => {
  try {
    if (req.file) {
      const file = req.file as IFile;
      const cloudinaryRes = await fileUploads.uploadToCloudinary(file);
      req.body.profileImage = await cloudinaryRes.secure_url;
    }

    const hashPassword = await bcrypt.hash(req.body.password, 12);

    const userData = {
      name: req.body.name,
      email: req.body.email,
      password: hashPassword,
      phoneNumber: req.body.phoneNumber,
      profileImage: req.body.profileImage,
    };

    const result = await prisma.user.create({
      data: userData,
    });

    return result;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const field = error.meta?.target?.[0];
        if (field === 'email') {
          throw new AppError(409, 'Email already exists');
        } else if (field === 'phoneNumber') {
          throw new AppError(409, 'Phone number already exists');
        }
      }
    }

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
