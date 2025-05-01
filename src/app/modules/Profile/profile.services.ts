import { Request } from "express"
import prisma from "../../shared/prisma"
import { IProfile } from "./profile.interface"
import { fileUploads } from "../../helpers/fileUploader"

const getSingleProfile = async (id: string) => {
  const result = await prisma.user.findUniqueOrThrow({ where: { id} })
  return result  
}
const updateUserProfile = async (id: string,req:Request) => {

  await prisma.user.findUniqueOrThrow({ where: { id} })
  const payload = req.body
if (req.file) {
    const file = req.file as Express.Multer.File;
    const uploadToCloudinary = await fileUploads.uploadToCloudinary(file);
    payload.profileImage = uploadToCloudinary.secure_url;
  }

const result = await prisma.user.update({
  where:{id},
  data:payload
})


  return result  
}


export const ProfileService = {
  getSingleProfile,updateUserProfile
}