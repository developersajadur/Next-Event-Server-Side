import { Request, Response } from "express";
import config from "../../config";
import catchAsync from "../../helpers/catchAsync";
import { sslCommerzService } from "./sslcommerz.service";
import sendResponse from "../../helpers/sendResponse";
import status from "http-status";
import AppError from "../../errors/AppError";

const validatePaymentService = catchAsync(async (req, res) => {
  const tran_id = req.query.tran_id as string;
  // console.log(tran_id);
  const result = await sslCommerzService.validatePayment(tran_id);
  console.log(result);

  if (result) {
    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Payment successful",
      data: {
        success_url: config.ssl.success_url as string
      },
    })
    res.redirect(301, config.ssl.success_url as string);
  } else {
    res.redirect(301, config.ssl.failed_url as string);
  }
});


const handleIPN = catchAsync(async (req: Request, res: Response) => {
  const { tran_id } = req.body;
  const result = await sslCommerzService.validatePayment(tran_id);

  if (result) {
    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Payment successful",
      data: result,
    });
  } else {
    throw new AppError(status.BAD_REQUEST, "Payment failed");
  }
});
  

export const SSLController = {
  validatePaymentService,
  handleIPN
};
