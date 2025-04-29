import express from 'express';
import multer from 'multer';
import { userController } from './user.controller';
const router = express.Router();
const upload = multer();
router.post('/', upload.none(), userController.createUserIntoDB);

export const userRouter = router;
