import { Request, Response } from 'express';
import status from 'http-status';
import catchAsync from '../../helpers/catchAsync';
import sendResponse from '../../helpers/sendResponse';
import { userService } from './user.service';

const createUserIntoDB = catchAsync(async (req: Request, res: Response) => {
  // console.log('Received body:', req.body);
  const result = await userService.createUserIntoDB(req);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'user created successfully',
    data: result,
  });
});
const getAllUsersFromDB = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.getAllUsersFromDB();

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'users fetched successfully',
    data: result,
  });
});
// getAllUsersFromDB
export const userController = {
  createUserIntoDB,
  getAllUsersFromDB

};
