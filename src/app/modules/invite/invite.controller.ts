import { Request, Response } from "express";
import catchAsync from "../../helpers/catchAsync";
import { InviteService } from "./invite.service";
import sendResponse from "../../helpers/sendResponse";
import status from "http-status";

const sentInvite = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const user = req.user;
  const payload = req.body;

  const result = await InviteService.sentInvite({
    ...payload,
    inviteSenderId: user.id,
  });

  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Invite sent successfully",
    data: result,
  });
});

const getMyAllSendInvites = catchAsync(async (req: Request & { user?: any }, res: Response) => {
    const user = req.user;
    
    const result = await InviteService.getMyAllSendInvites(user.id);
    
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "All sent invites retrieved successfully",
        data: result,
    });
})

const getMyAllReceivedInvites = catchAsync(async (req: Request & { user?: any }, res: Response) => {
    const user = req.user;
    
    const result = await InviteService.getMyAllReceivedInvites(user.id);
    
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "All received invites retrieved successfully",
        data: result,
    });
})

const acceptInvite = catchAsync(async (req: Request, res: Response) => {
    const { inviteId } = req.params;
    
    const result = await InviteService.acceptInvite(inviteId);
    
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Invite accepted successfully",
        data: result,
    });
})



const rejectInvite = catchAsync(async (req: Request, res: Response) => {
    const { inviteId } = req.params;
    
    const result = await InviteService.RejectInvite(inviteId);
    
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Invite rejected successfully",
        data: result,
    });
})


const getAllInvite = catchAsync(async (req, res) => {
  const result = await InviteService.getAllInvite();
   
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "All Invite Fached successfully",
    data: result,
});
})


export default {
  sentInvite,
  getMyAllSendInvites,
  getMyAllReceivedInvites,
  acceptInvite,
  getAllInvite,
  rejectInvite
};
