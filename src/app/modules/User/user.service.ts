import bcrypt from 'bcrypt';
import { fileUploads } from '../../helpers/fileUploader';
import { IFile } from '../../interfaces/file';
import prisma from '../../shared/prisma';

// createUserIntoDB
const createUserIntoDB = async (req: any) => {
  console.log(req.body, req.file);
  if (req.file) {
    const file = req.file as IFile;
    const cloudinaryRes = await fileUploads.uploadToCloudinary(file);
    req.body.profileImage = cloudinaryRes.secure_url;
  }

  const hashPassword = await bcrypt.hash(req.body.password, 12);

  const userData = {
    name: req.body.name,
    email: req.body.email,
    password: hashPassword,
    phoneNumber: req.body.phoneNumber,
    profileImage: req.body.profileImage, // from cloudinary or empty string
  };

  const result = await prisma.user.create({
    data: userData,
  });

  return result;
};

export const userService = {
  createUserIntoDB,
};
