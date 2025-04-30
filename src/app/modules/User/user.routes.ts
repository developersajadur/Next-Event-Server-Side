import express, { NextFunction, Request, Response } from 'express';
import { fileUploads } from '../../helpers/fileUploader';
import { userController } from './user.controller';
import { createUserZodSchema } from './user.validation';
const router = express.Router();
router.post(
  '/',
  fileUploads.upload.single('file'),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = createUserZodSchema.parse(JSON.parse(req.body.data));
    return userController.createUserIntoDB(req, res, next);
  },
);

export const userRouter = router;

// router.post(
//     "/create-patient",
//     auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PATIENT),
//     fileUploads.upload.single("file"),
//     (req: Request, res: Response, next: NextFunction) => {
//       req.body = userValidation.createPatient.parse(JSON.parse(req.body.data));

//       return userController.createPatient(req, res);
//     }
//   );
