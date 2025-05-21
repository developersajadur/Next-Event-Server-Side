import status from "http-status";
import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../helpers/sendResponse";
import { metaService } from "./meta.service";


const getMetaData = catchAsync(async (req, res) => {
    const result = await metaService.getMetaData();
      sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Meta data retrieved successfully",
    data: result,
  });
})



export const metaController = {
    getMetaData,
}