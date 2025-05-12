import { ParticipationStatus } from '@prisma/client';
import { Request } from 'express';
import catchAsync from '../../helpers/catchAsync';
import { participantService } from './participant.service';
import sendResponse from '../../helpers/sendResponse';
import status from 'http-status';
import { participantFilterableFields } from './participant.constants';
import RefineQuery from '../../helpers/RefineQuery';

const createParticipant = catchAsync(
  async (req: Request & { user?: any }, res) => {
    // console.log(req);
    const payload = await req.body;
    const user = await req.user;
    const dataToSend = {
      eventId: payload.eventId,
      userId: user.id,
      joinedAt: new Date()
    };
    const result = await participantService.createParticipant(dataToSend);

    sendResponse(res, {
      statusCode: status.CREATED,
      success: true,
      message: 'Participant created successfully',
      data: result,
    });
  },
);

const getAllParticipants = catchAsync(async (req, res) => {
  const query = RefineQuery(
    req.query,
    participantFilterableFields.concat('searchTerm'),
  );
  const options = RefineQuery(req.query, [
    'limit',
    'page',
    'sortBy',
    'sortOrder',
  ]);

  const result = await participantService.getAllParticipants(query, options);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: 'Participants fetched successfully',
    data: {
      data: result.data,
      meta: result.meta,
    },
  });
});

const getAllParticipantsByEventId = catchAsync(async (req, res) => {
  const { eventId } = req.params;
  const result = await participantService.getAllParticipantsByEventId(eventId);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: 'Participants fetched successfully',
    data: result,
  });
});

const updateParticipantStatus = catchAsync(async (req, res) => {
  const { participantId, status } = req.params;

  const result = await participantService.updateParticipantStatus(
    participantId,
    status as ParticipationStatus,
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Participant status updated successfully',
    data: result,
  });
});

export const participantController = {
  createParticipant,
  getAllParticipants,
  getAllParticipantsByEventId,
  updateParticipantStatus,
};
