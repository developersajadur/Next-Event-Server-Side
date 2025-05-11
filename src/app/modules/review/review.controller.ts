import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../helpers/sendResponse";
import httpStatus, { status } from "http-status";
import { ReviewServices } from "../review/review.service";
import { Request } from "express";
import { ITokenUser } from "../user/user.interface";
import AppError from "../../errors/AppError";


const createReview = catchAsync(async (req: Request & { user?: any }, res) => {
  const payload = req.body;
  // console.log(payload);
  const user = req.user;
  const reviewerId = user?.id;
    const result = await ReviewServices.createReview({...payload, reviewerId}, user.id);  
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

  const getMyReviews = catchAsync(async (req: Request& {user?: ITokenUser}, res): Promise<void>  => {
        const user = req.user;
           if (!user) {
      throw new AppError(status.UNAUTHORIZED, 'user not found');
    }

    const result = await ReviewServices.getMyReviews(user.id);
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


  const getReviewsByEventId = catchAsync(async (req, res) => {
    const { eventId } = req.params;
    const result = await ReviewServices.getReviewsByEventId(eventId);
  
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Review fetch successfully!",
      data: result,
    });
  })

export const ReviewController = {
    createReview,
    getAllReview,
    deleteReview,
    updateReview,
    getMyReviews,
    getReviewsByEventId
}