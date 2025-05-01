import express, { NextFunction, Request, Response } from 'express';
import { fileUploads } from '../../helpers/fileUploader';
import { userController } from './user.controller';
import { createUserZodSchema } from './user.validation';
const router = express.Router();

router.get('/', userController.getAllUsersFromDB);
router.get('/:id', userController.getSingleUserFromDB);
router.delete('/:id', userController.deleteUserFromDB);
router.post(
  '/register',
  fileUploads.upload.single('file'),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = createUserZodSchema.parse(JSON.parse(req.body.data));
    return userController.createUserIntoDB(req, res, next);
  },
);
export const userRouter = router;
