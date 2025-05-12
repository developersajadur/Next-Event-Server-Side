import status from "http-status";
import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../helpers/sendResponse";
import { paymentService } from "./payment.service";
import { Request } from "express";
import RefineQuery from "../../helpers/RefineQuery";
import { paymentFilterableFields } from "./payment.constants";


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

  const getAllPayments = catchAsync(async (req, res) => {
    const query = RefineQuery(
      req.query,
      paymentFilterableFields.concat('searchTerm'),
    );
  
    const options = RefineQuery(req.query, [
      'limit',
      'page',
      'sortBy',
      'sortOrder',
    ]);
  
    const result = await paymentService.getAllPayments(query, options);
  
    sendResponse(res, {
      success: true,
      statusCode: status.OK,
      message: 'Payments fetched successfully',
      data: {
        data: result.data,
        meta: result.meta,
      },
    });
  });
  

  export const paymentController = {
    createOrder,
    getMyPayments,
    getAllPayments
  }
  