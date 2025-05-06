import { Request, Response } from "express"
import catchAsync from "../../helpers/catchAsync"
import { ProfileService } from "./profile.services"
import sendResponse from "../../helpers/sendResponse"
import httpStatus, { status } from 'http-status';

const getSingleProfile=catchAsync(async(req:Request,res:Response)=>{
    const result=await ProfileService.getSingleProfile(req.params.id)
       
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Profile fetched  successfully',
        data: result
    })
})
const updateUserProfile = catchAsync(async (req: Request, res: Response) => {
    const result = await ProfileService.updateUserProfile(req.params.id, req)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Profile updated successfully',
        data:result
})
})

const getMyProfileData = catchAsync(  async (req: Request & { user?: any }, res) => {
    const user = req.user;

    const result = await ProfileService.getMyProfileData(user.id);

    sendResponse(res, {
      statusCode: status.CREATED,
      success: true,
      message: 'Profile updated successfully',
      data: result,
    });
  },)


export const ProfileController={
    getSingleProfile,updateUserProfile,getMyProfileData
}