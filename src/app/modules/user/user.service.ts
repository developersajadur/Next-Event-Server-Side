import { Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import config from '../../config';
import AppError from '../../errors/AppError';
import { jwtHelpers } from '../../helpers/jwtHelpers';
import prisma from '../../shared/prisma';
import { publicUserSelectFields, TUserPayload } from '../user/user.interface';
// createUserIntoDB
const createUserIntoDB = async (userData: TUserPayload) => {
  const { password, ...restData } = userData;
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: restData.email },
    });
    
    if (existingUser) {
      throw new AppError(409, 'Email already exists');
    }
    console.log('Email is available, proceeding with user creation.');

    // Hash password
    console.log('Hashing password...');
    const hashPassword = await bcrypt.hash(password, 12);
    console.log('Password hashed successfully.');

    const newUserData = {
      ...restData,
      password: hashPassword,
    };

    // Create new user
    const newUser = await prisma.user.create({
      data: newUserData,
    });
    console.log('User created successfully:', newUser);

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
          console.error('Email conflict detected');
          throw new AppError(409, 'Email already exists');
        } else if (field === 'phoneNumber') {
          console.error('Phone number conflict detected');
          throw new AppError(409, 'Phone number already exists');
        }
      }
    }

    console.error('Error occurred while creating or logging in user:', error);
    throw new AppError(500, 'Failed to create or login user');
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
