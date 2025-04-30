import status from "http-status";
import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../helpers/sendResponse";
import { tokenDecoder } from "../../helpers/tokenDecoder";
import { paymentService } from "./payment.service";


const createOrder = catchAsync(async (req, res) => {
    const decoded = tokenDecoder(req);
    const { id } = decoded;
    const payload = {userId: id, ...req?.body}

    const result = await paymentService.createPayment(payload);
  
    sendResponse(res, {
      statusCode: status.CREATED,
      success: true,
      message: "Payment created succesfully",
      data: result,
    });
  });


  export const paymentController = {
    createOrder,
  }
  