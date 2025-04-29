import { User } from '@prisma/client';
import prisma from '../../shared/prisma';
import { TUserPayload } from './user.interface';

// createUserIntoDB
const createUserIntoDB = async (payload:TUserPayload): Promise<User | null> => {


  const userData = {
    name: payload.name,
    email: payload.email,
    password: payload.password,
    phoneNumber: payload.phoneNumber,
    profileImage: payload.profileImage,
  };
  const result = await prisma.user.create({
    data: userData,
  });
  return result;
};


export const userService = {
  createUserIntoDB,
};
