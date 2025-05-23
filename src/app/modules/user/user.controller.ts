import { Request, Response } from 'express';
import status from 'http-status';
import config from '../../config';
import catchAsync from '../../helpers/catchAsync';
import sendResponse from '../../helpers/sendResponse';
import { userService } from '../user/user.service';
import { userFilterableFields } from './user.constants';
import RefineQuery from '../../helpers/RefineQuery';


const createUserIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.createUserIntoDB(req.body);
  res.cookie('refreshToken', result.refreshToken, {
    secure: config.node_env === 'production',
    httpOnly: true,
    sameSite: 'none',
    maxAge: 1000 * 60 * 60 * 24 * 365,
  });
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'User registered and logged in successfully',
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  });
});


// getAllUsersFromDB
const getAllUsersFromDB = catchAsync(async (req: Request, res: Response) => {
  const query = RefineQuery(
      req.query,
      userFilterableFields.concat('searchTerm'),
    );
  
    const options = RefineQuery(req.query, [
      'limit',
      'page',
      'sortBy',
      'sortOrder',
    ]);
  
    const result = await userService.getAllUsersFromDB(query, options);
  
    sendResponse(res, {
      success: true,
      statusCode: status.OK,
      message: 'Users fetched successfully',
      data: {
        data: result.data,
        meta: result.meta,
      },
    });
  });

// getSingleUserFromDB
const getSingleUserFromDB = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await userService.getSingleUserFromDB(id);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'users fetched successfully',
    data: result,
  });
});

// delete user
const deleteUserFromDB = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await userService.deleteUserFromDB(id);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'user deleted successfully',
    data: result,
  });
});

export const userController = {
  createUserIntoDB,
  getAllUsersFromDB,
  getSingleUserFromDB,
  deleteUserFromDB,
};
