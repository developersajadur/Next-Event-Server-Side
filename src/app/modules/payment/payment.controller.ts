import status from "http-status";
import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../helpers/sendResponse";
import { paymentService } from "./payment.service";
import { Request } from "express";


const createOrder = catchAsync(async (req: Request & {user?: any}, res) => {
  const user = req.user;
  // console.log(user);
    const payload = {userId: user.id , ...req?.body}

    const result = await paymentService.createPayment(payload);
  
    sendResponse(res, {
      statusCode: status.CREATED,
      success: true,
      message: "Payment created succesfully",
      data: result,
    });
  });

  const getMyPayments = catchAsync(async (req: Request & {user?: any}, res) => {
    const user = req.user;
    const result = await paymentService.getMyPayments(user.id);
  
    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Payments retrieved successfully",
      data: result,
    });
  })


  export const paymentController = {
    createOrder,
    getMyPayments
  }
  