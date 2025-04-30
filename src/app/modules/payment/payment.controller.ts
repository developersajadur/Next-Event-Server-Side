import status from "http-status";
import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../helpers/sendResponse";
import { tokenDecoder } from "../../helpers/tokenDecoder";
import { paymentService } from "./payment.service";


const createOrder = catchAsync(async (req, res) => {
    const decoded = tokenDecoder(req);
    const { email } = decoded;

    const result = await paymentService.createPayment(
      req.body,
    );
  
    sendResponse(res, {
      statusCode: status.CREATED,
      success: true,
      message: "Order created succesfully",
      data: result,
    });
  });
  