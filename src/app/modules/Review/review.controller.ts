import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../helpers/sendResponse";
import httpStatus from "http-status";
import { ReviewServices } from "./review.service";
import { Request } from "express";


const createReview = catchAsync(async (req: Request & { user?: any }, res) => {
  const payload = req.body;
  const userId = req.user.id;
  console.log("User from token:", req.user);
    const result = await ReviewServices.createReview({...payload, userId});  
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Review created successfully!",
      //meta: result.meta,
      data: result,
    });
  });
  

  const getAllReview = catchAsync(async (req, res) => {
    const { rating, user } = req.query;
    const filter: any = {};

    if (rating) {
      const parsedRating = Number(rating);
      if (!isNaN(parsedRating)) {
        filter.rating = parsedRating;
      }
    }
  
    if (user) {
      filter.user = user as string;
    }

    const result = await ReviewServices.getAllReview(filter);
  
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "All Review fetch successfully!",
      data: result,
    });
  });

  const updateReview = catchAsync(async (req: Request & { user?: any }, res) => {
    const reviewId = req.params.id;
    const userId = req.user?.id;
    const payload = req.body;
  
    const result = await ReviewServices.updateReview(reviewId, userId, payload);
  
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Review updated successfully!",
      data: result,
    });
  });

  const getMyReviews = catchAsync(async (req, res): Promise<void>  => {
    const { id } = req.params;
    const result = await ReviewServices.getMyReviews(id);
  
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "your Review fetch successfully!",
      data: result,
    });
  });

  const deleteReview = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await ReviewServices.deleteReview(id);
  
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Review Delete successfully!",
      data: result,
    });
  });


  const getUserAllReviews = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await ReviewServices.getUserAllReviews(id);
  
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Review Delete successfully!",
      data: result,
    });
  });

  const getReviewsByEvent = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await ReviewServices.getReviewsByEvent(id);
  
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "get Reviews By Event successfully!",
      data: result,
    });
  });



export const ReviewController = {
    createReview,
    getAllReview,
    deleteReview,
    updateReview,
    getMyReviews,
    getUserAllReviews,
    getReviewsByEvent
}