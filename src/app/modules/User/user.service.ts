import bcrypt from 'bcrypt';
import { Request } from 'express';
import { fileUploads } from '../../helpers/fileUploader';
import { IFile } from '../../interfaces/file';
import prisma from '../../shared/prisma';
import { publicUserSelectFields } from './user.interface';

// createUserIntoDB
const createUserIntoDB = async (req: Request) => {
  if (req.file) {
    const file = req.file as IFile;
    const cloudinaryRes = await fileUploads.uploadToCloudinary(file);
    req.body.profileImage = await cloudinaryRes.secure_url;
  }
  // console.log(req.body.profileImage);

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
};

// get User
const getAllUsersFromDB = async () => {
  const result = await prisma.user.findMany({
    select: publicUserSelectFields,
  });
  return result;
};
// get single user by id
const getSingleUserFromDB = async (id:string) => {
  const result = await prisma.user.findUniqueOrThrow({
    where: {
      id
    }
  });
  return result;
};

// delete user
const deleteUserFromDB = async (id: string) => {
  // console.log(id)
  await prisma.user.findFirstOrThrow({
    where: {
      id,
    },
  });
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
