import bcrypt from 'bcrypt';
import { Request } from 'express';
import AppError from '../../errors/AppError';
import { fileUploads } from '../../helpers/fileUploader';
import { jwtHelpers } from '../../helpers/jwtHelpers';
import { IFile } from '../../interfaces/file';
import prisma from '../../shared/prisma';
// import { publicUserSelectFields } from './user.interface';
import config from '../../config';
import { Prisma } from '@prisma/client';
// createUserIntoDB
const createUserIntoDB = async (req: Request) => {
  // console.log("service data ", req.body)
  try {
    const {
      name,
      email,
      password,
      phoneNumber,
      gender,
      address,
      occupation,
      bio,
    } = req.body;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError(409, 'Email already exists');
    }

    let profileImage: string | undefined;
    if (req.file) {
      const file = req.file as IFile;
      const cloudinaryRes = await fileUploads?.uploadToCloudinary(file);
      profileImage = await cloudinaryRes.secure_url;
    }

    // Hash password
    const hashPassword = await bcrypt.hash(password, 12);

    const userData = {
      name,
      email,
      password: hashPassword,
      phoneNumber,
      gender,
      address,
      occupation,
      bio,
      profileImage,
    };
    // console.log("from service", userData);

    // Create new user
    const newUser = await prisma.user.create({
      data: userData,
    });

    // token payload
    const tokenPayload = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      profileImage: newUser.profileImage ?? undefined,
      phoneNumber: newUser.phoneNumber,
      address: newUser.address,
      occupation: newUser.occupation,
      bio: newUser.bio,
      isDeleted: newUser.isDeleted,
      isBlocked: newUser.isBlocked,
    };

    // Generate access and refresh tokens
    const accessToken = jwtHelpers.createToken(
      tokenPayload,
      config.jwt.ACCESS_TOKEN_SECRET as string,
      config.jwt.ACCESS_TOKEN_EXPIRES_IN as string,
    );
    const refreshToken = jwtHelpers.createToken(
      tokenPayload,
      config.jwt.REFRESH_TOKEN_SECRET as string,
      config.jwt.REFRESH_TOKEN_EXPIRES_IN as string,
    );

    return {
      user: newUser,
      accessToken,
      refreshToken,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const field = (error.meta?.target as string[])?.[0];
        if (field === 'email') {
          throw new AppError(409, 'Email already exists');
        } else if (field === 'phoneNumber') {
          throw new AppError(409, 'Phone number already exists');
        }
      }
    }

    throw new AppError(500, 'Failed to create or login user');
  }
};

// get User
const getAllUsersFromDB = async () => {
  const result = await prisma.user.findMany({
    // select: publicUserSelectFields,
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
