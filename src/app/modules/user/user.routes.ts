import express, { NextFunction, Request, Response } from 'express';
import { fileUploads } from '../../helpers/fileUploader';
import { userController } from '../user/user.controller';
import { createUserZodSchema } from '../user/user.validation';
import { Role } from '@prisma/client';
import auth from '../../middlewares/Auth';
const router = express.Router();

router.get('/', userController.getAllUsersFromDB);
router.get('/:id', userController.getSingleUserFromDB);
router.patch(
  '/delete/:id',
  auth(Role.ADMIN),
  userController.deleteUserFromDB,
);
router.patch(
  '/block/:id',
  auth(Role.ADMIN),
  userController.blockUserFromDb,
);

router.post(
  '/register',
  fileUploads.upload.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsedData = JSON.parse(req.body.data);
      if (req.file) {

        const cloudinaryRes = await fileUploads.uploadToCloudinary(req.file)
    

        parsedData.profileImage=cloudinaryRes.secure_url
      }

      const validatedData = createUserZodSchema.parse(parsedData);
      req.body = validatedData;
 
      return userController.createUserIntoDB(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

export const userRouter = router;
