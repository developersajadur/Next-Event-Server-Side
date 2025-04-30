import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../helpers/sendResponse";
import httpStatus from "http-status";
import { ReviewServices } from "./review.service";

const createReview = catchAsync(async (req, res) => {
  console.log("data",req.body)
    const result = await ReviewServices.createReview(req.body);  
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Review created successfully!",
      //meta: result.meta,
      data: result,
    });
  });
  

  const getAllReview = catchAsync(async (req, res) => {
    const result = await ReviewServices.getAllReview();
  
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "All Review fetch successfully!",
      data: result,
    });
  });

  const deleteReview = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await ReviewServices.deleteReview(id);
  
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Review Delete successfully!",
      data: result,
    });
  });

export const ReviewController = {
    createReview,
    getAllReview,
    deleteReview
}